# Mombot

Mom is a bot that strives to do everything just like your real mom! From quizzing you at home, showing you the weather, teaching you some cool words, playing some sweet tunes, showing you some memes, and much more!

The best part is mom is opensource!

# Node

- Version 16.15.0 LTS.

# Config file

- Need to rename **config_shadow.json** to **config.json** in order for the config to work correctly.
- Please reference the API section to locate/sign up for tokens.
- You do not need all the tokens to run mom, however certain commands will not work and crashes may occur.

# Database - Mongo

- Mongo auto creates collections and inserts info.
- You will need to setup a database with a username and password. If you do not want a username/password you can edit the connection url in the mongoCon.js.

# Discord

- Version 14.11.0

# Docker

- Version 20.10.12.
- Added **Dockerfile** to the project for the option to run mom in a container.

# API's

- MealDB: https://www.themealdb.com/api.php
- Oxford Dictionary: https://developer.oxforddictionaries.com/
- Steam Web: https://partner.steamgames.com/doc/webapi_overview
- Weather: https://openweathermap.org/api
- OpenAI: https://platform.openai.com/docs/api-reference?lang=node.js

# How to use Mom

- You will have to deploy the commands to the respective guilds using the `deploy-commands.js`. This is WIP but should work manually for now.
- When the commands are deployed you should see the slash `/` commands available for mom in your guild.
- To use OpenAI just type `hey mom` in chat to start speaking with mom and `bye mom` to close the chat.

# Other

- I am working on this project for fun and will add or remove features when I have time to do so.
