"use strict";
const { glitchApi } = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord) => {
  glitchApi(
    msg,
    "Coin flip",
    "https://and-here-is-my-code.glitch.me/coinflip",
    true
  );
};