const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

// Constants
const ROLE_ID = process.env.ROLE_ID;
const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID;
const SERVER_ID = process.env.SERVER_ID;
const DM_CONTENT = `You Must Accept the Voice Chat Rules!!!. Before you can use voice activity, livestream, or turn on your webcam, you must first read and accept our Voice Chat Rules as well. Please review these rules as they are much more in depth than general server rules. Thank you! Visit <#${RULES_CHANNEL_ID}> to read and accept the voice rules.`

// Set up logging
const { createLogger, transports, format } = require('winston');
const logger = createLogger({
  level: 'info', // Set the logging level to 'info' (you can adjust it as needed)
  format: format.combine(
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss a'}),
    format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
  ),
  transports: [
    new transports.File({ filename: 'bot.log' }), // Log to a file
    new transports.Console() // Log to the console
  ]
});

// Create a new Discord client with GatewayIntentBits
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Custom error handler
async function handle_error(error_message) {
  logger.error(error_message);
}

// Event handler when the bot is ready
client.once('ready', () => {
  logger.info(`Logged in as ${client.user.tag}`);
  const targetGuild = client.guilds.cache.get(SERVER_ID);
  if (targetGuild) {
    logger.info(`Bot is connected to the target server (guild): ${targetGuild.name}`);
  } else {
    logger.warning(`Bot is not connected to the target server (guild): ${SERVER_ID}`);
  }
});

// Event handler when a user's voice state changes
client.on('voiceStateUpdate', async (oldState, newState) => {
  const warnChannel = client.channels.cache.get(RULES_CHANNEL_ID);
  const targetGuild = client.guilds.cache.get(SERVER_ID);
  
  if (targetGuild && !oldState.channel && newState.channel) {
    const member = newState.member;

    // Check if the user is a bot
    if (!member.user.bot) {
      // Check if the user has the specified role
      const role = targetGuild.roles.cache.get(ROLE_ID);
      if (role && !member.roles.cache.has(ROLE_ID)) {
        // Send DM to the user
        try {
          const msg = await warnChannel.send(`<@${member.user.id}> You Must Accept the Voice Chat Rules Before you can use voice activity, livestream, or turn on your webcam, Scroll up and read through them, then react to the ✅ to get the DJ role.`);
          await member.send(DM_CONTENT);
          logger.info(`Rules Solicitation DM sent to ${member.user.tag}`);
          
          // Delay for 120 seconds before deleting the message
          setTimeout(async () => {
            await msg.delete();
            logger.info(`Solicitation warning for ${member.user.tag} has been deleted.`);
          }, 120000); // 120,000 milliseconds = 120 seconds
        } catch (error) {
          await handle_error(`Failed to send DM to ${member.user.tag}. The user might have DMs disabled or blocked.`);
        }
      }
    }
  }
});

// Event handler when a user reacts to a message
client.on('messageReactionAdd', async (reaction, user) => {
  const channel = reaction.message.channel;
  const targetGuild = client.guilds.cache.get(SERVER_ID);

  if (channel.id === RULES_CHANNEL_ID) {
    // Get the member object from the user
    const member = targetGuild.members.cache.get(user.id);

    if (member) {
      // Check if the user has the specified role
      const role = targetGuild.roles.cache.get(ROLE_ID);
      if (role && !member.roles.cache.has(ROLE_ID)) {
        // Assign the role to the user
        try {
          await member.roles.add(role);
          logger.info(`Assigned ${role.name} role to ${member.user.tag}`);
        } catch (error) {
          await handle_error(`Failed to assign ${role.name} role to ${member.user.tag}. The bot might not have sufficient permissions.`);
        }
      }
    }
  }
});

// Log in to Discord with your app's token
client.login(process.env.BOT_TOKEN);
