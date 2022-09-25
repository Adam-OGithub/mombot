"use strict";
const { glitchApi, errHandler } = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    glitchApi(false, "meme", msg, "Meme", true);
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
