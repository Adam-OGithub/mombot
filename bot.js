"use strict";
const Discord = require("discord.js");
const client = new Discord.Client();
const {
  genInfo,
  getPre,
  parseUsrChan,
  getCommand,
  getIsMom,
  errmsg,
  cmsg,
  getDirFiles,
  getToken,
  momReact,
  momL,
} = require("./custom_nodemods/utils.js");
const { webdb } = require("./custom_nodemods/webconnect.js");
const {
  changeAc,
  reminders,
  playstation5,
} = require("./custom_nodemods/timers.js");
const allComs = getDirFiles("../commands");
//Runs commands based on args
const alt = async (select, dir, client, message, args, Discord, infoObj) => {
  try {
    const runCommand = require(`./${dir}/${select}.js`);

    if (message.author.bot !== true || allComs.includes(select)) {
      momL(infoObj, select);
      if (dir !== "momcommands") {
        momReact(message, client, infoObj);
      }
      runCommand.run(client, message, args, Discord, infoObj);
    }
  } catch (e) {
    errmsg(e);
  }
};

//Start Bot and database
client.on("ready", () => {
  webdb();
  console.log(`\x1b[32m`, `${client.user.tag} is online!`);
  changeAc(client);
  reminders(client);
  playstation5(client);
});

client.on("message", (message) => {
  const [channels, users, usersF] = parseUsrChan(message.content);
  const infoObj = genInfo(message, client);
  const isMom = getIsMom(users, client);
  const cmd = getCommand(infoObj, allComs);
  const argIndex = infoObj.msg.split(" ").indexOf(`${getPre()}${cmd}`);
  const args = infoObj.msg.split(" ").slice(argIndex, message.content.length);
  const msgParse = infoObj.msg.split(" ");
  if (cmd !== null) {
    alt(cmd, "commands", client, message, args, Discord, infoObj);
  } else if (message.mentions.everyone) {
    alt("mentionall", "momcommands", client, message, args, Discord, infoObj);
  } else if (isMom) {
    alt("atmom", "momcommands", client, message, args, Discord, infoObj);
  } else if (msgParse.includes("help") && msgParse.includes("mom")) {
    const autoHelp = [`help`];
    alt(autoHelp, "commands", client, message, args, Discord, infoObj);
  } else {
    alt("hello", "momcommands", client, message, args, Discord, infoObj);
  }
});
client.login(getToken());
