"use strict";
const { sMsg, getHelp, getPre } = require("../custom_nodemods/utils.js");
const config = require("../config.json");
const axios = require("../node_modules/axios");
const {
  perms,
  getRoles,
  checkRoles,
} = require("../custom_nodemods/permissions.js");
exports.run = async (client, msg, args, discord, infoObj) => {
  let isAdmin = false;
  let count = 0;
  let fArgs = ``;
  const myCheck = infoObj.msg.split("");
  myCheck.forEach((entry) => {
    if (entry === `"` || entry === `”` || entry === `“`) {
      count++;
    }
  });

  if (count === 2) {
    fArgs = infoObj.msg
      .split(`${getPre()}set`)[1]
      .split("")
      .map((letter) =>
        letter === `"` || letter === `”` || letter === `“` ? `^^A^^` : letter
      )
      .join("")
      .split("^^A^^");
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
          console.log(arg);
          console.log(args[2]);
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
          getHelp(msg.channel);
        }
      } else {
        sMsg(msg.channel, "You must get permission from Dad.");
      }
    })
    .catch((e) => {
      console.log(e);
    });
};
