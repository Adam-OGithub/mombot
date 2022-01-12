"use strict";
const Discord = require("discord.js");
const config = require("../config.json");
const { emotes, capFirst, sMsg } = require("../custom_nodemods/utils.js");
const pollMap = new Map();

const check = (text, map) => {
  if (map === undefined) {
    if (pollMap.has(text)) {
      return true;
    } else {
      return false;
    }
  } else {
    if (map.has(text)) {
      return true;
    } else {
      return false;
    }
  }
};

const setLower = (input) => {
  const newInput = input.map((arg) => arg.toLowerCase());
  return newInput;
};
exports.run = async (client, msg, args, discord, infoObj) => {
  setLower(args);
  const fArgs = setLower(infoObj.msg.split(" "));
  const command = args[0];
  const text1 = args[1];
  const text2 = args[2];

  if (command === "create" && text1 !== undefined && text2 !== undefined) {
    let str = ``;
    if (check(text1)) {
      sMsg(
        msg,
        `Poll with that name already exists please try another name hun.`
      );
    } else {
      for (let i = 2; i < args.length; i++) {
        str += `${args[i]} `;
      }
      let hasQ = ``;
      if (str.split("").includes("?") === false) {
        hasQ = "?";
      }
      pollMap.set(text1, { question: `${capFirst(str)}${hasQ}` });

      if (check(text1)) {
        sMsg(msg, `Poll ${text1} has been created just for you sweety!`);
      } else {
        sMsg(
          msg,
          `Poll ${text1} failed to be created, but you can do it next time hun.`
        );
      }
    }
  } else if (command === "add" && text1 !== undefined && text2 !== undefined) {
    if (check(text1)) {
      const arr = [];
      const myObj = pollMap.get(text1);
      const myChoices = fArgs.slice(3, fArgs.length).join(" ").split(",");
      let cObj = {};
      for (let i = 0; i < myChoices.length; i++) {
        cObj.choice = myChoices[i];
        cObj.votes = 0;
        arr.push(cObj);
        cObj = {};
      }
      myObj.choices = arr;
      if (myObj.choices.length > 0) {
        sMsg(msg, `Questions added, just for my sweet baby!`);
      } else {
        sMsg(
          msg,
          `Questions failed to be created, just like mom failed to get her wine glass today..`
        );
      }
    } else {
      sMsg(
        msg,
        `Looks like that poll does not exist sweety better luck next time.`
      );
    }
    //
  } else if (command === "start" && text1 != undefined) {
    //post poll
    if (check(text1)) {
      const myObj = pollMap.get(text1);
      let str = ``;
      const newEmoteArr = [];
      myObj.choices.forEach((obj, i) => {
        newEmoteArr.push(emotes[i]);
        str += `${emotes[i]} - ${capFirst(obj.choice)}\n\n`;
      });
      let embed = new Discord.MessageEmbed()
        .setTitle(`${myObj.question}`)
        .setColor(config.color)
        .setDescription(`${str}`);
      sMsg(msg, embed, true, newEmoteArr);
    } else {
      sMsg(
        msg,
        `Looks like that poll does not exist sweety better luck next time.`
      );
    }
  } else {
    sMsg(msg, `${config.prefix}help`);
  }
};
