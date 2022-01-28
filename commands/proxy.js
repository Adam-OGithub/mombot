"use strict";
const axios = require("../node_modules/axios");
const { sMsg, makeEmbed, tryFail } = require("../custom_nodemods/utils.js");
const config = require("../config.json");
exports.run = async (client, msg, args, discord) => {
  try {
    const options = {
      headers: {
        "x-rapidapi-host": config.getproxy.host,
        "x-rapidapi-key": config.getproxy.key,
      },
    };

    axios
      .get(`https://proxy-orbit1.p.rapidapi.com/v1/`, options)
      .then((res) => {
        try {
          const data = res.data;
          let str;
          for (const entry in data) {
            if (entry !== "websites") {
              str += `${entry}: ${data[entry]}\n`;
            }
          }
          const embed = makeEmbed("Proxy Info", str);
          sMsg(msg.channel, embed);
        } catch (e) {
          console.log(e);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
