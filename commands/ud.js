const ud = require("relevant-urban");
const { sMsg, makeEmbed } = require("../custom_nodemods/utils");
exports.run = async (client, msg, args, discord) => {
  let worder = args[0];
  if (!worder) return sMsg(msg.channel, `Specify a Word`);
  let defin = await ud(args.join(" ")).catch((e) => {
    sMsg(msg.channel, `Word not found`);
    return;
  });

  let embed = makeEmbed(
    defin.word,
    defin.definition,
    undefined,
    defin.urbanURL
  );

  sMsg(msg.channel, embed);
};
