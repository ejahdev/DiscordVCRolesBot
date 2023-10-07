import discord
import asyncio
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Constants
ROLE_ID = int(os.environ.get("ROLE_ID"))
RULES_CHANNEL_ID = int(os.environ.get("RULES_CHANNEL_ID"))
SERVER_ID = int(os.environ.get("SERVER_ID"))  # Define SERVER_ID
DM_CONTENT = "You Must Accept the Voice Chat Rules!!!. Before you can use voice activity, livestream, or turn on your webcam, you must first read and accept our Voice Chat Rules as well. Please review these rules as they are much more in depth than general server rules. Thank you! Visit <#" + str(RULES_CHANNEL_ID) + "> to read and accept the voice rules."


# Set up logging
logging.basicConfig(
    level=logging.INFO,  # Set the logging level to INFO (you can adjust it as needed)
    format='%(asctime)s [%(levelname)s]: %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),  # Log to a file
        logging.StreamHandler()  # Log to the console
    ]
)

# Intents
intents = discord.Intents.default()
intents.reactions = True
intents.guilds = True
intents.members = True

client = discord.Client(intents=intents)

# Custom error handler
async def handle_error(error_message):
    logging.error(error_message)

@client.event
async def on_ready():
    logging.info(f"Logged in as {client.user.name}")
    target_guild = client.get_guild(SERVER_ID)
    if target_guild is not None:
        logging.info(f"Bot is connected to the target server (guild): {target_guild.name}")
    else:
        logging.warning(f"Bot is not connected to the target server (guild): {SERVER_ID}")

@client.event
async def on_voice_state_update(member, before, after):
    warn_channel = client.get_channel(RULES_CHANNEL_ID)
    target_guild = client.get_guild(SERVER_ID)
    if target_guild is not None and before.channel is None and after.channel is not None:
        # Check if the user is a bot
        if not member.bot:
            # Check if the user has the specified role
            role = target_guild.get_role(ROLE_ID)
            if role is not None and role not in member.roles:
                # Send DM to the user
                try:
                    msg = await warn_channel.send(f'{member.mention} You Must Accept the Voice Chat Rules!!!. Before you can use voice activity, livestream, or turn on your webcam, you must first read and accept our Voice Chat Rules as well. Please review these rules as they are much more in depth than general server rules. Thank you! Visit <#{RULES_CHANNEL_ID}> to read and accept the voice rules.')
                    await member.send(DM_CONTENT)
                    logging.info(f"Rules Solicitation DM sent to {member.name}")
                    await asyncio.sleep(120)
                    await msg.delete()
                    logging.info(f"Solicitation warning for {member.name} has been deleted.")
                except discord.Forbidden:
                    await handle_error(f"Failed to send DM to {member.name}. The user might have DMs disabled or blocked.")

@client.event
async def on_raw_reaction_add(payload):
    # Check if the reaction is in the specified rules channel
    channel_id = payload.channel_id
    target_guild = client.get_guild(SERVER_ID)

    if target_guild is None:
        await handle_error(f"Target guild (SERVER_ID: {SERVER_ID}) not found.")
        return

    target_channel = target_guild.get_channel(channel_id)

    if target_channel is None:
        await handle_error(f"Target channel (ID: {channel_id}) not found in guild {target_guild.name}.")
        return

    if channel_id == target_channel.id:
        user_id = payload.user_id
        # Get the member object from the user ID
        member = target_guild.get_member(user_id)
        
        if member is None:
            await handle_error(f"Member with ID {user_id} not found in guild {target_guild.name}.")
            return

        # Check if the user has the specified role
        role = target_guild.get_role(ROLE_ID)

        if role is None:
            await handle_error(f"Role with ID {ROLE_ID} not found in guild {target_guild.name}.")
            return

        if role not in member.roles:
            # Assign the role to the user
            try:
                await member.add_roles(role)
                logging.info(f"Assigned {role.name} role to {member.name}")
            except discord.Forbidden:
                await handle_error(f"Failed to assign {role.name} role to {member.name}. The bot might not have sufficient permissions.")


client.run(os.environ.get("BOT_TOKEN"))