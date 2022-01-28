"use strict";
const { glitchApi, capFirst, tryFail } = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord) => {
  try {
    glitchApi(
      msg,
      "Coin flip",
      "https://and-here-is-my-code.glitch.me/coinflip",
      true
    );
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
