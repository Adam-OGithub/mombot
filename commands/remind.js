"use strict";
const {
  sMsg,
  getHelp,
  getChannel,
  parseUsrChan,
  exceptions,
  parseQuote,
  countQuote,
  tryFail,
  errmsg,
} = require("../custom_nodemods/utils.js");
const { getRoles } = require("../custom_nodemods/permissions.js");
const { mongoQuery, mongoInsert } = require("../custom_nodemods/mongoCon.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    let isInPrison = false;
    getRoles(infoObj.currentGuild, infoObj.userId)
      .then((roleObj) => {
        const reminder = {};
        let query;
        let count = 0;
        mongoQuery({ guildId: infoObj.guildID }, "prison").then((res) => {
          console.log(res[0].prisonRole);
          if (res[0].prisonRole !== undefined) {
            console.log(res[0].prisonRole);
            roleObj.roles.forEach((role) => {
              console.log(role);
              if (role === res[0].prisonRole) {
                isInPrison = true;
              }
            });
          }

          if (isInPrison) {
            //
            sMsg(msg.channel, "Naughty Children do not get reminders!");
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
                query = {
                  guildId: infoObj.guildID,
                  posterId: infoObj.tag,
                  users: cleanMsg(reminder.users),
                  channels: cleanMsg(reminder.channels),
                  message: cleanMsg(reminder.msg),
                  time: reminder.future,
                };

                mongoInsert(query, "reminders").then((res) => {
                  if (res.acknowledged) {
                    sMsg(msg.channel, "Reminder added!");
                  } else {
                    sMsg(msg.channel, "Reminder not added.");
                  }
                });
              } else {
                getHelp(msg.channel, "remind");
              }
            } else {
              getHelp(msg.channel, "remind");
            }
          }
        });
      })
      .catch((e) => {
        errmsg(e);
      });
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
//DELETE FROM remind WHERE id = "1";
