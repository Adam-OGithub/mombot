"use strict";
const {
  sMsg,
  getHelp,
  getChannel,
  getPre,
  parseUsrChan,
  exceptions,
} = require("../custom_nodemods/utils.js");
const config = require("../config.json");
const axios = require("../node_modules/axios");

exports.run = async (client, msg, args, discord, infoObj) => {
  const reminder = {};
  const myReq = {};
  let count = 0;
  //check if entry is user or channel
  const [channels, users, usersF] = parseUsrChan(infoObj.msg);
  reminder.users = `${usersF.join(" ")}`;
  const myCheck = infoObj.msg.split("");
  myCheck.forEach((entry) => {
    if (entry === `"` || entry === `”`) {
      count++;
    }
  });

  if (count === 4) {
    const fArgs = infoObj.msg
      .split(`${getPre()}remind`)[1]
      .split("")
      .map((letter) => (letter === `"` || letter === `”` ? `^^A^^` : letter))
      .join("")
      .split("^^A^^");
    reminder.timetemp = fArgs[1];
    reminder.msg = fArgs[3];
  }

  if (channels.length > 0 && reminder?.timetemp !== " " && count === 4) {
    const channelArr = [];
    channels.forEach((entry) => {
      channelArr.push(getChannel(entry, infoObj));
    });
    reminder.channels = channelArr.join(" ");

    const time = reminder.timetemp
      .split("/")
      .join("^")
      .split(" ")
      .join("^")
      .split(":")
      .join("^")
      .split("^");
    let hour = 0;
    if (time[5] !== undefined) {
      const loc = time[5].toLowerCase();
      switch (loc) {
        case "cst":
          hour = 6;
          break;
        case "est":
          hour = 7;
          break;
        case "mnt":
          hour = 5;
          break;
        case "pst":
          hour = 4;
          break;
        default:
          hour = 100;
          break;
      }
    }
    //Hour is subtract from central cst
    if (time[5] !== undefined && hour !== 100) {
      reminder.future =
        new Date(
          +`${time[2]}`, //year
          +time[0] - 1, //month 0-11
          +time[1], // day 1-31
          +time[3] - hour, // hours 0-23 UTC
          +time[4], // minutes 0-59
          0, //seconds
          0 //mil seconds
        ) / 1000;

      const cleanMsg = (msg) => {
        const msgArr = msg
          .split("")
          .map((char) => {
            return exceptions.includes(char) ? `` : char;
          })
          .join("");
        return msgArr;
      };
      myReq.query = `INSERT INTO remind (guildid,userid,names,channels,message,time) VALUES (${
        infoObj.guildID
      },"${infoObj.tag}","${cleanMsg(reminder.users)}","${cleanMsg(
        reminder.channels
      )}","${cleanMsg(reminder.msg)}",${reminder.future}) `;

      axios
        .post(config.web.dburl, myReq)
        .then((res) => {
          if (res?.data !== undefined) {
            sMsg(msg.channel, "Reminder added!");
          } else {
            sMsg(msg.channel, "Reminder not added.");
          }
        })
        .catch((e) => {
          console.log(`${e}`);
        });
    } else {
      getHelp(msg.channel);
    }
  } else {
    getHelp(msg.channel);
  }
};
//DELETE FROM remind WHERE id = "1";
