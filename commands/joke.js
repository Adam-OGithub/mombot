"use strict";
const { glitchApi, errHandler } = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    glitchApi(false, "joke", msg, "Jokes");
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
