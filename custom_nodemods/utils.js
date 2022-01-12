"use strict";
const Discord = require("discord.js");
const config = require("../config.json");
const randomWord = (arr) => arr[Math.trunc(Math.random() * arr.length)];

const round = (myInt) => Math.trunc(myInt);

const markovMe = (input) => {
  const markovChain = {};
  const textArr = input.split(" ");
  for (let i = 0; i < textArr.length; i++) {
    let word = textArr[i].toLowerCase().replace(/[\W_]/, "");
    if (!markovChain[word]) {
      markovChain[word] = [];
    }
    if (textArr[i + 1]) {
      markovChain[word].push(textArr[i + 1].toLowerCase().replace(/[\W_]/, ""));
    }
  }
  const words = Object.keys(markovChain);
  let word = words[Math.floor(Math.random() * words.length)];
  let result = "";
  for (let i = 0; i < words.length; i++) {
    result += word + " ";
    let newWord =
      markovChain[word][Math.floor(Math.random() * markovChain[word].length)];
    word = newWord;
    if (!word || !markovChain.hasOwnProperty(word))
      word = words[Math.floor(Math.random() * words.length)];
  }
  return result;
};

const capFirst = (str) =>
  str !== undefined
    ? str[0].toUpperCase() + str.slice(1)
    : `Mom still loves you honey, even though you were born an error`;

const emotes = [
  "🐶",
  "🐺",
  "🐷",
  "🐱",
  "🦁",
  "🐯",
  "🦒",
  "🦊",
  "🦝",
  "🐮",
  "🐗",
  "🐭",
  "🐹",
  "🐰",
  "🐻",
  "🐨",
  "🐼",
  "🐸",
  "🦓",
  "🐴",
  "🦄",
  "🐔",
  "🐲",
  "🦍",
  "🐖",
  "🦨",
  "🐳",
  "🐠",
  "🐟",
];

const sMsg = (
  mainObj,
  mainMsg,
  react = false,
  arr,
  reply = false,
  bot = false,
  msg
) => {
  // el.channel.send(arg);
  mainObj.channel.send(mainMsg).then((sent) => {
    if (react) {
      if (arr !== undefined) {
        arr.forEach((entry) => {
          sent.react(`${entry}`);
        });
      }
    } else if (reply && msg !== undefined) {
      if (bot) {
        sent.reply(msg);
      } else {
        mainObj.reply(msg);
      }
    }
  });
};

const genInfo = (msg, client) => {
  const myObj = {};
  myObj.channelId = msg.channel.id;
  myObj.channelName = msg.channel.name;
  myObj.nsfw = msg.channel.nsfw;
  myObj.lastMsg = msg.channel.lastMessageID;
  myObj.guildID = msg.guild.id;
  myObj.guildName = msg.guild.name;
  myObj.afkId = msg.guild.afkChannelID;
  myObj.msg = msg.content;
  myObj.msgId = msg.id;
  myObj.userName = msg.author.username;
  myObj.userId = msg.author.id;
  myObj.userUid = msg.author.discriminator;
  myObj.isBot = msg.author.bot;
  if (client !== undefined) {
    myObj.currentGuild = client.guilds.cache.get(myObj.guildID);
    myObj.guildMemCount = myObj.currentGuild.memberCount;
    myObj.guildOwner = myObj.currentGuild.ownerID;
    myObj.guildRoles = myObj.currentGuild.roles.cache;
    myObj.guildChannels = myObj.currentGuild.channels.cache;
    myObj.guildMembers = myObj.currentGuild.members.cache;
    myObj.guildPres = myObj.currentGuild.presences.cache;
    myObj.guildvoice = myObj.currentGuild.voiceStates.cache;
  }

  return myObj;
};

const randomInt = (min, max) =>
  Math.floor(Math.trunc(Math.random() * (max - min) + 1) + min);

const makeEmbed = (title, description, fields, url, image) => {
  let embed = new Discord.MessageEmbed()
    .setTitle(title)
    .setColor(config.color)
    .setDescription(description);

  if (fields !== undefined) {
    fields.forEach((field) => {
      embed.addField(field.label, field.val);
    });
  }

  if (url !== undefined) {
    embed.setURL(url);
  }

  if (image !== undefined) {
    embed.setImage(image);
  }
  return embed;
};

const getHelp = (msg) => {
  sMsg(msg, `${config.prefix}help`);
};
exports.randomWord = randomWord;
exports.round = round;
exports.markovChain = markovMe;
exports.capFirst = capFirst;
exports.emotes = emotes;
exports.sMsg = sMsg;
exports.genInfo = genInfo;
exports.randomInt = randomInt;
exports.makeEmbed = makeEmbed;
exports.getHelp = getHelp;