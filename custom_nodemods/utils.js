"use strict";
const Discord = require("discord.js");
const config = require("../config.json");
const path = require("path");
const fs = require("fs");
const axios = require("../node_modules/axios");
//Gets prefix for command from config
const getPre = () => {
  let prefix;
  if (config.testing.usedev) {
    prefix = config.testing.prefix;
  } else {
    prefix = config.prefix;
  }
  return prefix;
};

//Selects a random word from an array
const randomWord = (arr) => arr[Math.trunc(Math.random() * arr.length)];

//Rounds intergers
const round = (myInt) => Math.trunc(myInt);

//Generates a markov chain from a string
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

//Capitalises first letter in a string
const capFirst = (str) =>
  str !== undefined
    ? str[0].toUpperCase() + str.slice(1)
    : `Mom still loves you honey, even though you were born an error`;

//List of emotes
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

//Sends message to respective channel or reacts to message
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
  mainObj
    .send(mainMsg)
    .then((sent) => {
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
    })
    .catch((e) => {
      console.log(e);
    });
};

//Generates client and message information for easieraccess
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
  myObj.tag = msg.author.tag;
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

//Generates a random number between a min and max
const randomInt = (min, max) =>
  Math.floor(Math.trunc(Math.random() * (max - min) + 1) + min);

//Creates an embed
const makeEmbed = (title, description, fields, url, image) => {
  let embed = new Discord.MessageEmbed()
    .setTitle(title)
    .setColor(config.color)
    .setDescription(description);

  console.log(`-------------------`);
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

const getToken = () => {
  let token = ``;
  //Gets tokens from config
  if (config.testing.usedev) {
    token = config.tokens.dev;
  } else {
    token = config.tokens.prod;
  }
  return token;
};
//Returns help menu
const getHelp = (msg) => {
  sMsg(msg, `${getPre()}help`);
  console.log(`hit`);
};

//returns timeouts in minutes
const setTimoutMin = (min) => {
  const minutes = min;
  const seconds = minutes * 60;
  const time = seconds * 1000;
  return time;
};

//Object for easy dates
const dateInfo = {
  full: () => new Date(),
  year: () => new Date().getFullYear(),
  month: () => new Date().getMonth(),
  day: () => new Date().getDay(),
  hour: () => new Date().getHours(),
  minute: () => new Date().getMinutes(),
  second: () => new Date().getSeconds(),
  milsecond: () => new Date().getMilliseconds(),
  epocSecs: () => Math.floor((new Date() - setTimoutMin(360)) / 1000),
};

//Gets the channel object
const getChannel = (channelId, infoObj) =>
  infoObj.currentGuild.channels.cache.get(channelId);

//Get the user object
const getUser = (userId, client) => client.users.cache.get(userId);

//Gets guild obj
const getGuild = (guildId, client) => client.guilds.cache.get(guildId);

//Gets channel and users id and objects
const parseUserChannel = (message) => {
  const sInfo = message.split(" ");
  const channels = [];
  const users = [];
  const usersF = [];
  sInfo.forEach((entry) => {
    if (entry.startsWith("<#") && entry.endsWith(">")) {
      channels.push(entry.slice(2, -1));
    } else if (entry.startsWith("<@") && entry.endsWith(">")) {
      let men = entry.slice(2, -1);
      if (men.startsWith(`!`)) {
        usersF.push(entry);
        users.push(men.slice(1));
      } else {
        usersF.push(entry);
        users.push(men);
      }
    }
  });
  return [channels, users, usersF];
};

//Checks if use sending command is mom
const getIsMom = (users, client) => {
  let isMom = false;
  //looks for mom to see if mentioned
  users.forEach((userid) => {
    let userObj = getUser(userid, client);
    if (userObj?.username === "MOM" && userObj?.bot) {
      isMom = true;
    }
  });
  return isMom;
};

//send erros message to console
const errmsg = (e) => {
  console.error(`\x1b[32m`, `[ERROR]: ${e.message}`);
};

//Sends log to console
const cmsg = (str) => {
  console.log(str);
};

//Gets the current files in a directory and removes .js
const getDirFiles = (dir) => {
  const comDir = path.join(__dirname, dir);
  const allComs = [];
  fs.readdir(comDir, (e, files) => {
    if (e) throw cmsg(e);
    files.forEach((f) => {
      allComs.push(f.split(".js")[0]);
    });
  });
  return allComs;
};

//Gets the command location and then returns the command entered
//Used for inline commandssd
const getCommand = (infoObj, allComs) => {
  const argsAll = infoObj.msg.slice(getPre().length).trim().split(" ");
  let cmd = null;
  allComs.forEach((c) => {
    let loc = argsAll.indexOf(`${getPre()}${c.toLowerCase()}`);
    if (loc !== -1) {
      cmd = argsAll[loc].split(getPre())[1];
    } else if (infoObj.msg.indexOf(getPre()) === 0) {
      cmd = argsAll[0];
    }
  });
  return cmd;
};

const exceptions = [
  `||`,
  `-`,
  `*`,
  `-`,
  `<>`,
  `<`,
  `>`,
  `,`,
  `=`,
  `<=`,
  `>=`,
  `~=`,
  `!=`,
  `^=`,
  `(`,
  `)`,
  `@`,
  `!`,
  `/`,
  `#`,
];

const glitchApi = (msg, label, link, image = undefined) => {
  axios
    .get(link)
    .then((res1) => {
      let out, des;
      if (image !== undefined) {
        out = res1.data.Link;
        des = ``;
      } else {
        out = undefined;
        des = res1.data.Link;
      }
      const embed = makeEmbed(label, des, undefined, undefined, out);
      sMsg(msg.channel, embed);
    })
    .catch((e) => {
      console.log(e);
    });
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
exports.dates = dateInfo;
exports.getChannel = getChannel;
exports.getUser = getUser;
exports.getPre = getPre;
exports.parseUsrChan = parseUserChannel;
exports.getIsMom = getIsMom;
exports.setTimoutMin = setTimoutMin;
exports.errmsg = errmsg;
exports.cmsg = cmsg;
exports.getDirFiles = getDirFiles;
exports.getCommand = getCommand;
exports.getToken = getToken;
exports.getGuild = getGuild;
exports.exceptions = exceptions;
exports.glitchApi = glitchApi;
