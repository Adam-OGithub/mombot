# mombot

A discord bot for mom

# Node

Version 16.13.1 is recommended

# Config file - config.json

- Location is main directory
- Name: config.json

  {
  "prefix": "$",
  "color": "RANDOM",
  "testing": {
  "usedev": false,
  "prefix": "!"
  },
  "tokens": {
  "dev": "xxxxx",
  "prod": "xxxxx",
  "weather": "xxxx"
  },
  "oxford": {
  "appid": "xxxx",
  "key": "xxxx"
  },
  "getproxy": {
  "host": "xxxx",
  "key": "xxxxxx"
  },
  "mealdb": {
  "key": "xxxx"
  },
  "database": {
  "name": "xxxx"
  }
  }

# Database - Mongo

- Mongo auto creates collections and inserts info.

# Add MOM without the hassel

May need to add seperate elevated roles.
https://discord.com/oauth2/authorize?client_id=846779816736849920&permissions=0&scope=bot%20applications.commands
