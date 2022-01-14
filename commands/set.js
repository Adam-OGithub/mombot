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
        myReq.query = ``;
        break;
      default:
    }

    axios
      .post(config.web.dburl, myReq)
      .then((res) => {
        console.log(res.data);
      })
      .catch((e) => {
        console.log(`error=${e}`);
      });
  } else {
    getHelp(msg.channel);
  }
};
