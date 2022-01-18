"use strict";
const { sMsg, getHelp } = require("../custom_nodemods/utils.js");
const config = require("../config.json");
const axios = require("../node_modules/axios");
exports.run = async (client, msg, args, discord, infoObj) => {
  const myReq = {};
  if (args[0] !== undefined) {
    const guild = infoObj.currentGuild;
    const arg = args[0].toLowerCase();
    switch (arg) {
      case "prison":
        myReq.query = `INSERT IGNORE INTO guild(guildid,name,owner,prisonid) VALUES (${infoObj.guildID},"${infoObj.guildName}",${infoObj.guildOwner},${infoObj.channelId})`;
        break;
      case "prison remove":
        myReq.query = ``;
        break;
      case "hello":
        myReq.query = ``;
        break;
      case "hello remove":
        myReq.query = ``;
        break;
      default:
    }
    axios
      .post(config.web.dburl, myReq)
      .then((res) => {
        if (res?.data && res?.data?.affectedRows > 0) {
          sMsg(msg.channel, `Momma has updated this channel to be the prison!`);
        }
      })
      .catch((e) => {
        console.log(`${e}`);
      });
  } else {
    getHelp(msg.channel);
  }
};
