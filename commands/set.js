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
        myReq.query = `REPLACE INTO guild SET guildid = ${infoObj.guildID}, name = "${infoObj.guildName}", owner = ${infoObj.guildOwner}, prisonid = ${infoObj.channelId}`;
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
        if (res?.data !== undefined) {
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
