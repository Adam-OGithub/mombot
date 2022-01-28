"use strict";
const { glitchApi, tryFail } = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord) => {
  try {
    glitchApi(msg, "Meme", "https://and-here-is-my-code.glitch.me/meme", true);
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
