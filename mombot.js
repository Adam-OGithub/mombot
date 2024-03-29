'use strict';
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { checkPolls } = require('./timers/pollcheck.js');
const { checkReminders } = require('./timers/remindercheck.js');
const { dateInfo } = require('./custom_node_modules/utils.js');
const chatMap = new Map();
const {
  getToken,
  getCommandPath,
} = require('./custom_node_modules/security.js');
const gBits = GatewayIntentBits;
const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const comPath = getCommandPath();
const initChatRegex = new RegExp('hey mom', 'gi');
const endChatRegex = new RegExp('bye mom', 'gi');
const timeOutMinutes = 60 * 2;
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

const getResponseFromMom = async (msg, msgContent) => {
  const runChat = require(`./chat_commands/mom.js`);
  msg.channel.sendTyping();
  // const newMsg = msgContent.replace(/hey mom/gi, '');
  await runChat.execute(client, msg, msgContent);
};

//On start this runs
client.on('ready', async () => {
  console.log(client.user.tag + ' is online!');

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
    await interaction.reply({
      content: `The command (${interaction.commandName}) does not exist!`,
      ephemeral: true,
    });
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
  try {
    // Message of the user
    const msgContent = msg.content;
    const authorId = msg.author.id;
    let expireBool = chatMap.get(authorId)?.expireTime <= dateInfo.sinceEpoc();
    let isBot = msg.author.bot;

    if (
      expireBool ||
      (endChatRegex.test(msgContent) && chatMap.has(authorId))
    ) {
      //removes user from map so messages do not trigger a response
      chatMap.delete(authorId);
      if (!expireBool) {
        await getResponseFromMom(msg, msgContent);
      }
    } else if (
      (!isBot && initChatRegex.test(msgContent)) ||
      (!isBot && chatMap.has(authorId))
    ) {
      //Sets authors id so they can chat with mom and not use the keywords with an expire time off two minutes if they do not chat with mom.
      chatMap.set(authorId, {
        expireTime: dateInfo.sinceEpoc() + timeOutMinutes,
      });
      await getResponseFromMom(msg, msgContent);
    }
  } catch (error) {
    console.error(error);
  }
});

client.login(getToken());

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
