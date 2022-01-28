"use strict";
const {
  sMsg,
  getHelp,
  getChannel,
  getPre,
  parseUsrChan,
  exceptions,
  parseQuote,
  countQuote,
  tryFail,
} = require("../custom_nodemods/utils.js");
const { getRoles } = require("../custom_nodemods/permissions.js");
const config = require("../config.json");
const axios = require("../node_modules/axios");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    let isInPrison = false;
    getRoles(infoObj.currentGuild, infoObj.userId)
      .then((roleObj) => {
        const reminder = {};
        const myReq = {};
        let count = 0;

        myReq.query = `SELECT prisonRole FROM prison_role WHERE guildid = ${infoObj.guildID}`;
        axios
          .post(config.web.dburl, myReq)
          .then((res) => {
            const prisonRole = res?.data?.result[0]?.prisonRole;
            if (prisonRole !== undefined) {
              roleObj.roles.forEach((role) => {
                if (role === prisonRole) {
                  isInPrison = true;
                }
              });
            }
            if (isInPrison) {
              //
              sMsg(msg.channel, "Naughty Children to not get reminders!");
            } else {
              //check if entry is user or channel
              const [channels, users, usersF] = parseUsrChan(infoObj.msg);
              reminder.users = `${usersF.join(" ")}`;
              const count = countQuote(infoObj);

              if (count === 4) {
                const fArgs = parseQuote(infoObj, "remind");
                reminder.timetemp = fArgs[1];
                reminder.msg = fArgs[3];
              }

              if (
                channels.length > 0 &&
                reminder?.timetemp !== " " &&
                count === 4
              ) {
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
                  getHelp(msg.channel, "remind");
                }
              } else {
                getHelp(msg.channel, "remind");
              }
            }
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
//DELETE FROM remind WHERE id = "1";
