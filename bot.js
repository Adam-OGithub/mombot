"use strict";
const { Client, GatewayIntentBits } = require("discord.js");
const gBits = GatewayIntentBits;
const Discord = require("discord.js");
const path = require("path");
const fs = require("fs");
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

const config = require(`./config.json`);
const { commandSpam, spamMsg } = require(`./custom_nodemods/spamprotect.js`);
const {
  genInfo,
  getPre,
  parseUsrChan,
  getCommand,
  getIsMom,
  getToken,
  momReact,
  momL,
  sMsg,
  errHandler,
  getChannel,
  argToReg,
  msgAuth,
} = require("./custom_nodemods/utils.js");
const { changeAc, reminders, foodObj } = require("./custom_nodemods/timers.js");

const allComs = [];
const allMomComs = [];
const getDirFiles = (dir, commandArray) => {
  const files = fs.readdirSync(__dirname + "/" + dir);
  files.forEach((file) => {
    commandArray.push(file.split(".")[0]);
  });
};

getDirFiles("commands", allComs);
getDirFiles("momcommands", allMomComs);
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
const altMusic = ["play", "stop", "repeat", "skip", "queue", "volume", "add"];
const disabled = ["music", ...altMusic, "getinfo", "set"];
let countNum = 1;

const alt = async (select, dir, client, message, args, Discord, infoObj) => {
  try {
    infoObj.allComs = allComs;
    infoObj.altMusic = altMusic;
    infoObj.helloCount = countNum;

    // const currentUserMapped = await commandSpam(message, infoObj, select);
    // if (
    //   currentUserMapped?.bypass === true ||
    //   currentUserMapped.locked === false
    // ) {
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
              message.channel.sendTyping();
              momL(infoObj, newSelect);
            }

            if (dir !== "momcommands") {
              momReact(message, client, infoObj);
            }
            runCommand.run(client, message, args, Discord, infoObj);

            if (countNum === 20) {
              countNum = 1;
            }
            countNum++;
          }
        }
      }
    }
    // } else {
    //   spamMsg(message, select, infoObj, client);
    // }
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
  foodObj();
  // playstation5(client);
});

client.on("messageCreate", async (message) => {
  const [channels, users, usersF] = parseUsrChan(message.content);
  const infoObj = await genInfo(message, client);
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
