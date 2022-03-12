"use strict";
const ud = require("relevant-urban");
const { sMsg, makeEmbed, errHandler } = require("../custom_nodemods/utils");
exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    let worder = args[1];
    if (!worder) return sMsg(msg.channel, `Specify a Word`);
    let defin = await ud(args.slice(1, args.length).join(" ")).catch((e) => {
      sMsg(msg.channel, `Word not found`);
      return;
    });

    let embed = makeEmbed(
      defin?.word,
      defin?.definition,
      undefined,
      defin?.urbanURL
    );

    if (defin?.word && defin?.definition) {
      sMsg(msg.channel, embed);
    }
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
