"use strict";
const Discord = require("discord.js");
const config = require("./config.json");
const client = new Discord.Client();
const { botStatus } = require("./custom_nodemods/sayings.js");
const {
  randomWord,
  genInfo,
  getPre,
  parseUsrChan,
  getCommand,
  getIsMom,
  setTimoutMin,
  errmsg,
  cmsg,
  getDirFiles,
} = require("./custom_nodemods/utils.js");
const { webdb } = require("./custom_nodemods/webconnect.js");
const time = setTimoutMin(5);
const allComs = getDirFiles("../commands");
const changeAc = async () => {
  //sets activity for bot first
  client.user.setActivity(randomWord(botStatus));
  //sets bot activity every x minutes
  setInterval(() => {
    client.user.setActivity(randomWord(botStatus));
  }, time);
};

const myConf = {};
if (config.testing.usedev) {
  myConf.token = config.tokens.dev;
} else {
  myConf.token = config.tokens.prod;
}

const alt = async (select, dir, client, message, args, Discord, infoObj) => {
  try {
    const runCommand = require(`./${dir}/${select}.js`);
    if (message.author.bot !== true) {
      cmsg(`${infoObj.tag} ran '${select}.js' with args (${args})`);
      runCommand.run(client, message, args, Discord, infoObj);
    }
  } catch (e) {
    errmsg(e);
  }
};

webdb();
//Start Bot
client.on("ready", () => {
  console.log(`\x1b[32m`, `${client.user.tag} is online!`);
  changeAc();
});

client.on("message", (message) => {
  //Gets channels and users in message
  const [channels, users, usersF] = parseUsrChan(message.content);
  const infoObj = genInfo(message, client);
  const isMom = getIsMom(users);
  const cmd = getCommand(infoObj, allComs);
  const argIndex = infoObj.msg.split(" ").indexOf(`${getPre()}${cmd}`);
  const args = infoObj.msg.split(" ").slice(argIndex, message.content.length);

  if (cmd !== null) {
    alt(cmd, "commands", client, message, args, Discord, infoObj);
  } else if (message.mentions.everyone) {
    alt("mentionall", "momcommands", client, message, args, Discord, infoObj);
  } else if (isMom) {
    alt("atmom", "momcommands", client, message, args, Discord, infoObj);
  } else {
    alt("hello", "momcommands", client, message, args, Discord, infoObj);
  }
});
client.login(myConf.token);
