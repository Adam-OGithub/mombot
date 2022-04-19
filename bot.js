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
  argToReg,
} = require("./custom_nodemods/utils.js");
const { changeAc, reminders } = require("./custom_nodemods/timers.js");
const allComs = getDirFiles("../commands");
const allMomComs = getDirFiles("../momcommands");
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
const map = new Map();
const disabled = [];
const altMusic = ["play", "stop", "repeat", "skip", "queue", "volume", "add"];
let countNum = 1;
const alt = async (select, dir, client, message, args, Discord, infoObj) => {
  try {
    infoObj.allComs = allComs;
    infoObj.altMusic = altMusic;
    infoObj.helloCount = countNum;

    const channel = await getChannel(infoObj.channelId, infoObj);
    const perms = channel.permissionsFor(message.client.user);
    const [bool, permsFailed] = permCheck(perms);
    const guildFail = map.get(infoObj.guildID);
    if (bool) {
      if (message.author.bot !== true) {
        if (guildFail === undefined) {
          map.set(infoObj.guildID, true);
          sMsg(
            message.channel,
            `<@${infoObj.guildOwner}> Permissions required:\n${permsFailed.join(
              "\n"
            )}`
          );
        }
      }
    } else {
      let newSelect = select;
      let altSelectMusic = "";
      if (select.length >= 2) {
        newSelect = await argToReg(select, allComs);
        if (newSelect === true) {
          newSelect = await argToReg(select, allMomComs);
        }
        altSelectMusic = await argToReg(select, altMusic);
        if (altSelectMusic !== true) {
          newSelect = "music";
          args[0] = newSelect;
          args[2] = args[1];
          args[1] = altSelectMusic;
        }
      }

      if (guildFail) {
        map.delete(infoObj.guildID);
      }

      if (newSelect !== true) {
        if (disabled.includes(newSelect) && config.testing.usedev !== true) {
          sMsg(message.channel, `${newSelect} is disabled for now.`);
        } else {
          const runCommand = require(`./${dir}/${newSelect}.js`);

          if (message.author.bot !== true || allComs.includes(newSelect)) {
            //Does not log hello as it causes to much spam in logs
            if (newSelect !== "hello") {
              message.channel.startTyping();
              momL(infoObj, newSelect);
            }

            if (dir !== "momcommands") {
              momReact(message, client, infoObj);
            }

            runCommand.run(client, message, args, Discord, infoObj);
            message.channel.stopTyping();

            if (countNum === 20) {
              countNum = 1;
            }
            countNum++;
          }
        }
      }
    }
  } catch (e) {
    if (select !== "hello") {
      momL(infoObj, select);
    }
    message.channel.stopTyping();
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
