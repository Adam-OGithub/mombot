"use strict";
const { glitchApi, errHandler } = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    glitchApi(msg, "Meme", "https://and-here-is-my-code.glitch.me/meme", true);
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
