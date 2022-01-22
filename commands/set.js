"use strict";
const { sMsg, getHelp } = require("../custom_nodemods/utils.js");
const config = require("../config.json");
const axios = require("../node_modules/axios");
const { perms, getRoles } = require("../custom_nodemods/permissions.js");
exports.run = async (client, msg, args, discord, infoObj) => {
  let isAdmin = false;
  getRoles(msg.guild, infoObj.userId)
    .then((roles) => {
      roles.forEach((role) => {
        console.log(role);
        let roleCheck = msg.guild.roles.cache.get(role);
        if (roleCheck.permissions.has(perms.admin)) {
          console.log("This member is Admin");
          isAdmin = true;
        }
      });
      if (isAdmin) {
        const myReq = {};
        const arg1 = args[1];
        if (arg1 !== undefined) {
          let run = true;
          const arg = arg1.toLowerCase();
          console.log(arg);
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
            getHelp(msg.channel);
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
