"use strict";
const config = require("../config.json");
const {
  sMsg,
  makeEmbed,
  getHelp,
  dates,
  getChannel,
  getUser,
} = require("../custom_nodemods/utils.js");

const delay = async (reminder) => {
  setTimeout(() => {
    reminder.channels.forEach((channelObj) => {
      sMsg(channelObj, reminder.fullmsg);
    });
  }, reminder.time);
};

exports.run = async (client, msg, args, discord, infoObj) => {
  const sInfo = infoObj.msg.split(" ");
  const channels = [];
  const reminder = {};
  let count = 0;
  //check if entry is user or channel
  sInfo.forEach((entry) => {
    if (entry.startsWith("<#") && entry.endsWith(">")) {
      channels.push(entry.slice(2, -1));
    } else if (entry.startsWith("<@") && entry.endsWith(">")) {
      if (entry.slice(2, -1).startsWith(`!`)) {
        reminder.users += ` ${entry} `;
      } else {
        reminder.users += ` ${entry} `;
      }
    }
  });

  const myCheck = infoObj.msg.split("");
  myCheck.forEach((entry) => {
    if (entry === `"`) {
      count++;
    }
  });

  if (count === 4) {
    const fArgs = infoObj.msg
      .split(`${config.prefix}remind`)[1]
      .split("")
      .map((letter) => (letter === `"` ? `^^A^^` : letter))
      .join("")
      .split("^^A^^");
    console.log(fArgs);
    reminder.time = fArgs[1];
    reminder.msg = fArgs[3];
  }

  //Gets all channel objects mentioned
  if (channels.length > 0 && reminder?.time !== " " && count === 4) {
    const channelArr = [];
    channels.forEach((entry) => {
      channelArr.push(getChannel(entry, infoObj));
    });
    reminder.channels = channelArr;

    reminder.fullmsg = `${reminder.msg} ${reminder.users}`;
    delay(reminder);
  } else {
    getHelp(msg.channel);
  }
};
