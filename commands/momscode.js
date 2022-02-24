"use strict";
const { sMsg, makeEmbed, errHandler } = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    const embed = makeEmbed(
      "Moms Code",
      "This is the Github for me sweety, I love you!",
      undefined,
      "https://github.com/Adam-OGithub/mombot",
      "https://lh3.googleusercontent.com/SFIj6M4Tz8koUg9IcZPM4vUl_hilOpiqaBuuudUOOdONVj2doCUFQaAyUiFeSqkzPom0bQ=s88"
    );
    sMsg(msg.channel, embed);
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
