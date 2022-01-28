"use strict";
const {
  sMsg,
  getHelp,
  getPre,
  parseQuote,
  countQuote,
} = require("../custom_nodemods/utils.js");
const config = require("../config.json");
const axios = require("../node_modules/axios");
const {
  perms,
  getRoles,
  checkRoles,
} = require("../custom_nodemods/permissions.js");
exports.run = async (client, msg, args, discord, infoObj) => {
  let isAdmin = false;
  let fArgs = ``;
  const count = countQuote(infoObj);

  if (count === 2) {
    fArgs = parseQuote(infoObj, "set");
  }
  getRoles(msg.guild, infoObj.userId)
    .then((obj) => {
      const roleObj = checkRoles(msg, obj.roles, [perms.admin, perms.kick]);
      for (const prop in roleObj) {
        if (roleObj[prop]?.admin) {
          isAdmin = true;
        }
      }
      if (isAdmin && msg.author.bot !== true) {
        const myReq = {};
        const arg1 = args[1];
        if (arg1 !== undefined) {
          let run = true;
          const arg = arg1.toLowerCase();
          let momMsg = ``;
          switch (arg) {
            case "prison":
              myReq.query = `REPLACE INTO prison SET guildid = ${infoObj.guildID}, prisonid = ${infoObj.channelId}`;
              momMsg = `Momma has updated this channel to be the prison!`;
              break;
            case "prison_remove":
              myReq.query = `REPLACE INTO prison SET guildid = ${infoObj.guildID}`;
              momMsg = `Momma has removed the prison!`;
              break;
            case "prison_role":
              let hasVal = false;
              if (count === 2) {
                obj.guildRoles.forEach((value, key) => {
                  if (
                    fArgs[1].split(" ").join("").toLowerCase() ===
                    value?.name.split(" ").join("").toLowerCase()
                  ) {
                    myReq.query = `REPLACE INTO prison_role SET guildid = ${infoObj.guildID}, prisonRole = ${value.id}`;
                    hasVal = true;
                  }
                });
              }

              if (hasVal) {
                momMsg = `Prison role added!`;
              } else if (count < 2) {
                momMsg = `Did not quote role.`;
                run = false;
              } else {
                momMsg = `Unable to locate role.`;
                run = false;
              }
              break;
            case "hello":
              myReq.query = `REPLACE INTO hello SET guildid = ${infoObj.guildID}, helloid = ${infoObj.channelId}`;
              momMsg = `Momma has updated this channel to be able to speak with other discords.`;
              break;
            case "hello_remove":
              myReq.query = `REPLACE INTO hello SET guildid = ${infoObj.guildID}`;
              momMsg = `Momma will no longer allow other discords to speak here.`;
              break;
            default:
              run = false;
              momMsg = `Momma sending you some $${getPre()}help !`;
              break;
          }

          if (run) {
            axios
              .post(config.web.dburl, myReq)
              .then((res) => {
                if (res?.data !== undefined) {
                  sMsg(msg.channel, momMsg);
                }
              })
              .catch((e) => {
                console.log(`${e}`);
              });
          } else {
            sMsg(msg.channel, momMsg);
          }
        } else {
          getHelp(msg.channel, "set");
        }
      } else {
        sMsg(msg.channel, "You must get permission from Dad.");
      }
    })
    .catch((e) => {
      console.log(e);
    });
};
