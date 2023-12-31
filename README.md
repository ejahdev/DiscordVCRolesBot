# Discord Role Alert Bot

## Description

Discord Role Alert Bot is a script that monitors users joining voice channels in a Discord server and alerts them if they are missing a certain role. It provides a seamless way to guide users to read the server rules and automatically grant them the missing role once they react to the rules message.

This bot is intended to enhance community engagement and ensure that all members are aware of the server rules while providing a convenient mechanism to comply with the rules and gain the necessary roles.

## Features

- Monitors voice channel joins to check for missing roles.
- Sends alerts to users with missing roles, directing them to read the server rules.
- Listens for reactions on the rules message and grants the missing role to users who accept the rules.
- Customizable settings to specify the voice channels and role assignment behavior.

## How to Use

1. Clone the repository to your local machine.
2. Install the required dependencies:

   > pip install discord.py

   > pip install python-dotenv

   or 
   > npm install discord.js

   > npm install dotenv

   > npm install winston

3. Obtain your Discord bot token from the [Discord Developer Portal](https://discord.com/developers/applications).
4. Copy the token of your Discord bot and either place it in the BOT_TOKEN variable in the main script or run setup.py and paste your token when prompted.

5. Configure the necessary settings in the script, such as the desired voice channels and role assignment behavior in your .env file.
    ```bash
    BOT_TOKEN = ""
    SERVER_ID = 
    RULES_CHANNEL_ID = 
    ROLE_ID =
    ```

6. Run the script:

   > python VoiceChannelRoleBot.py
   
   or
   > node VoiceChannelRoleBot.js

7. Invite the bot to your Discord server using the OAuth2 URL generated in the [Discord Developer Portal](https://discord.com/developers/applications).

## Contributions

Contributions are welcome! If you find any issues or want to suggest improvements, feel free to create an issue or submit a pull request.

## Disclaimer

Please use this bot responsibly and in compliance with Discord's [Terms of Service](https://discord.com/terms) and [Developer Terms of Service](https://discord.com/developers/docs/legal).

## License

Not Listed
