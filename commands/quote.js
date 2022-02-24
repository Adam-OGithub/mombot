"use strict";
const { glitchApi, errHandler } = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    glitchApi(msg, "Quote", "https://and-here-is-my-code.glitch.me/quotes");
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
