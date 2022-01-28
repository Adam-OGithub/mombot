"use strict";
const { glitchApi, tryFail } = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord) => {
  try {
    glitchApi(msg, "Jokes", "https://and-here-is-my-code.glitch.me/joke");
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
