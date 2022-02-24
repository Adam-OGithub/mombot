"use strict";
const Discord = require("discord.js");
const config = require("../config.json");
const path = require("path");
const fs = require("fs");
const axios = require("../node_modules/axios");
const { mkactivity } = require("snekfetch");
const { mongoInsert, mongoQuery, mongoUpdate } = require("./mongoCon");
const { log } = require("util");
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
  return result.split(" ").slice(0, 30).join(" ");
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
  myObj.messageId = msg.id;
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
const makeEmbed = (
  title,
  description,
  fields,
  url,
  image,
  mutlifield,
  footer
) => {
  let embed = new Discord.MessageEmbed().setTitle(title).setColor(config.color);

  if (description !== false) {
    embed.setDescription(description);
  }

  if (fields !== undefined) {
    fields.forEach((field) => {
      embed.addField(field.label, field.val);
    });
  }
  if (mutlifield !== undefined) {
    mutlifield.forEach((field) => {
      embed.addFields(field);
    });
  }

  if (url !== undefined) {
    embed.setURL(url);
  }

  if (image !== undefined) {
    embed.setImage(image);
  }

  if (footer !== undefined) {
    embed.setFooter(footer);
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
const getHelp = (msg, cmd) => {
  if (cmd !== undefined) {
    sMsg(msg, `${getPre()}help ${cmd}`);
  } else {
    sMsg(msg, `${getPre()}help`);
  }
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

const getLastMsg = (msg, client, infoObj) => {
  const channelCache = client.channels.cache.get(infoObj.channelId);
  const msgCache = channelCache.messages.cache;
  return msgCache.get(msg.author.lastMessageID);
};
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

const errHandler = (error, infoObj = {}, message, channelObj) => {
  let getline = [];
  if (error?.stack) {
    const reg = new RegExp(`[.][j][s][:]`);
    const errArr = error.stack.split("at");
    errArr.forEach((entry) => {
      if (reg.test(entry)) {
        getline.push(entry);
      }
    });
  }

  if (infoObj?.msgId === undefined) {
    infoObj.msgId = 1;
  }
  const errorObj = {
    message: message,
    stack: error?.requireStack,
    code: error?.code,
    lines: getline,
    error: error,
  };

  if (infoObj.msgId !== 1) {
    mongoQuery({ messageId: infoObj.msgId }, config.database.log).then(
      (res) => {
        if (res.length > 0) {
          mongoUpdate(
            { messageId: infoObj.msgId },
            { $push: { errors: errorObj } },
            config.database.log
          );
        }
      }
    );
  } else {
    console.log(error);
  }

  if (channelObj !== undefined && message !== undefined) {
    let newMsg = message;
    if (message === true) {
      newMsg = "Momma is having a rough day sweety,try again in a little bit.";
    }
    sMsg(channelObj, newMsg);
  }
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

const makeClean = (theMsg) => {
  const bannedChars = [
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
    `.`,
  ];

  const bannedArr = [
    "use",
    "show",
    "auth",
    "drop",
    "update",
    "delete",
    "get",
    "hello",
    "find",
    "from",
    "create",
    "rename",
    "db",
    "insert",
    "set",
    "stats",
  ];
  let cleanMsg = theMsg;
  bannedArr.forEach((entry) => {
    const reg = new RegExp(`${entry}`, "g");
    cleanMsg = cleanMsg.replace(reg, "");
  });
  const cleanRemove = cleanMsg
    .split("")
    .map((entry) => {
      if (bannedChars.includes(entry)) {
        return "";
      } else {
        return entry;
      }
    })
    .join("");
  return cleanRemove;
};

//Logging to hjelp troubleshoot issues only gets up to 7 entries of args
const momL = (infoObj, select) => {
  const msg = infoObj.msg.toLowerCase();
  //console.log(makeReg());
  const logObj = {
    username: infoObj.tag,
    command: select,
    date: new Date(),
    guildName: infoObj.guildName,
    guildid: infoObj.guildID,
    channelName: infoObj.channelName,
    channelId: infoObj.channelId,
    message: makeClean(msg),
    messageId: infoObj.msgId,
  };
  mongoInsert(logObj, config.database.log);
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

//used for many of the fun functions to interact with the gltichapi website
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

//Parses quote replacing with ^^A^^ for easier manipulation
const parseQuote = (infoObj, cmd) => {
  const fullArgs = infoObj.msg
    .split(`${getPre()}${cmd}`)[1]
    .split("")
    .map((letter) =>
      letter === `"` || letter === `”` || letter === `“` ? `^^A^^` : letter
    )
    .join("")
    .split("^^A^^");
  return fullArgs;
};

//Counts the number of quotes in a message
const countQuote = (infoObj) => {
  let count = 0;
  const myCheck = infoObj.msg.split("");
  myCheck.forEach((entry) => {
    if (entry === `"` || entry === `”` || entry === `“`) {
      count++;
    }
  });
  return count;
};

const letters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];
//Parses uses and channels from a string and replacedwith the name
const parseRplc = (str, client, infoObj) => {
  const sQ = str.split(" ");
  const arr = [];
  sQ.forEach((word, i) => {
    if (word.startsWith("<@") && word.endsWith(">")) {
      let id;
      if (word.split("")[2] === "!") {
        id = word.split("").slice(3, word.length - 1);
      } else {
        id = word.split("").slice(2, word.length - 1);
      }
      const user = getUser(id.join(""), client);
      arr.push(`${user.username}#${user.discriminator}`);
    } else if (word.startsWith("<#") && word.endsWith(">")) {
      let id;
      if (word.split("")[2] === "!") {
        id = word.split("").slice(3, word.length - 1);
      } else {
        id = word.split("").slice(2, word.length - 1);
      }
      const channel = getChannel(id.join(""), infoObj);
      arr.push(channel.name);
    } else {
      arr.push(word);
    }
  });

  return arr.join(" ");
}; //Replays to a message object
const replyMsg = (messageObj, message) => {
  messageObj.reply(message);
};
//Emotes to a message Object
const emoteMsg = (messageObj, emote) => {
  messageObj.react(emote);
};

const momReact = (msg, client, infoObj) => {
  // const momEmotes = [`👾`, `👻`, `👽`, `😎`, `🧠`, `👀`, `👤`, `👁`];
  const lastMsg = getLastMsg(msg, client, infoObj);
  const emoteChar = `🦸‍♀️`; //randomWord(momEmotes);
  emoteMsg(lastMsg, emoteChar);
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
exports.getDirFiles = getDirFiles;
exports.getCommand = getCommand;
exports.getToken = getToken;
exports.getGuild = getGuild;
exports.glitchApi = glitchApi;
exports.parseQuote = parseQuote;
exports.countQuote = countQuote;
exports.letters = letters;
exports.parseRplc = parseRplc;
exports.getLastMsg = getLastMsg;
exports.replyMsg = replyMsg;
exports.emoteMsg = emoteMsg;
exports.momReact = momReact;
exports.momL = momL;
exports.makeClean = makeClean;
exports.errHandler = errHandler;
