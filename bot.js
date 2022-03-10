"use strict";
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require(`./config.json`);
const {
  genInfo,
  getPre,
  parseUsrChan,
  getCommand,
  getIsMom,
  getDirFiles,
  getToken,
  momReact,
  momL,
  sMsg,
  errHandler,
  getChannel,
} = require("./custom_nodemods/utils.js");
const { changeAc, reminders } = require("./custom_nodemods/timers.js");
const allComs = getDirFiles("../commands");
//Runs commands based on args
const permCheck = (perms) => {
  const requiredPerms = ["CONNECT", "SPEAK", "MANAGE_MESSAGES"];
  let value = false;
  let outArr = [];
  requiredPerms.forEach((perm) => {
    if (!perms.has(perm)) {
      value = true;
      outArr.push(perm);
    }
  });
  return [value, outArr];
};
const alt = async (select, dir, client, message, args, Discord, infoObj) => {
  try {
    const channel = await getChannel(infoObj.channelId, infoObj);
    const perms = channel.permissionsFor(message.client.user);
    const [bool, permsFailed] = permCheck(perms);
    if (bool) {
      if (message.author.bot !== true) {
        sMsg(
          message.channel,
          `Permissions required:\n${permsFailed.join("\n")}`
        );
      }
    } else {
      const disabled = [];
      if (
        disabled.includes(select.toLowerCase()) &&
        config.testing.usedev !== true
      ) {
        sMsg(message.channel, `${select} is disabled for now.`);
      } else {
        const runCommand = require(`./${dir}/${select}.js`);

        if (message.author.bot !== true || allComs.includes(select)) {
          //Does not log hello as it causes to much spam in logs
          if (select !== "hello") {
            momL(infoObj, select);
          }

          if (dir !== "momcommands") {
            momReact(message, client, infoObj);
          }
          runCommand.run(client, message, args, Discord, infoObj);
        }
      }
    }
  } catch (e) {
    if (select !== "hello") {
      momL(infoObj, select);
    }
    errHandler(e, infoObj);
  }
};

//Start Bot and database
client.on("ready", () => {
  console.log(`\x1b[32m`, `${client.user.tag} is online!`);
  changeAc(client);
  reminders(client);
  // playstation5(client);
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
    alt("help", "commands", client, message, args, Discord, infoObj);
  } else {
    alt("hello", "momcommands", client, message, args, Discord, infoObj);
  }
});
client.login(getToken());
