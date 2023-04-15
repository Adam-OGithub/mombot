'use strict';
const {
  REST,
  Routes,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
} = require('discord.js');
const { checkPolls } = require('./timers/pollcheck.js');
const { checkReminders } = require('./timers/remindercheck.js');
const { commandDeploy } = require('./deploy-commands.js');
const gBits = GatewayIntentBits;
const path = require('path');
const fs = require('fs');
const config = require(`./config.json`);
const https = require('https');
const express = require('express');
const app = express();
let comPath = '';
//Sets token

const setup = () => {
  if (config.testing.usedev) {
    comPath = 'testing';
  } else {
    comPath = 'commands';
  }
};

const token = () => {
  let theToken = null;
  if (config.testing.usedev) {
    theToken = config.tokens.dev;
  } else {
    theToken = config.tokens.prod;
  }
  return theToken;
};

setup();
//Sets clients permissions
const client = new Client({
  intents: [
    gBits.Guilds,
    gBits.GuildMessages,
    gBits.MessageContent,
    gBits.GuildMembers,
    gBits.GuildEmojisAndStickers,
    gBits.GuildVoiceStates,
    gBits.GuildMessageReactions,
    gBits.GuildMessageTyping,
    gBits.GuildWebhooks,
    gBits.DirectMessages,
    gBits.DirectMessageTyping,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, comPath);
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

//On start this runs
client.on('ready', async () => {
  console.log(client.user.tag + ' is online!');
  if (config.testing.usedev) {
    //TODO: Need to seperate this from this file into its own
    // console.log('client.user.id:', client.user.id);
    // commandDeploy(token(), client.user.id, config.testing.guildId, comPath);
  }

  //Timers
  checkPolls(client);
  checkReminders(client);
});

//Gets interactions to execute and handles errors
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

client.on('messageCreate', async msg => {
  // Message of the user
  // console.log(msg);
});

client.login(token());

//=========================================================
//Internal webserver for mombot
// app.post('/mombot/access/commands', async (req, res) => {
//   try {
//     res.json(resObj);
//   } catch (e) {
//     console.log(e);
//   }
// });

// const certs = {
//   key: fs.readFileSync('./certs/selfcerts/key.pem', 'utf8'),
//   cert: fs.readFileSync('./certs/selfcerts/cert.pem', 'utf8'),
//   passphrase: config.webserver.certpass,
// };

// const httpsServer = https.createServer(certs, app);
// const server = httpsServer.listen('6500', () => {
//   console.log(`\nMombot Web Server is ready on port 6500.`);
// });
