const Discord = require("discord.js");
const config = require("../config.json");
const ud = require("relevant-urban");
const { sMsg } = require("../custom_nodemods/utils");
exports.run = async (client, message, args, discord) => {
  let worder = args[0];
  if (!worder) return message.channel.send("Specify a word");
  let defin = await ud(args.join(" ")).catch((e) => {
    message.channel.send("Word not found");
    return;
  });
  let embed = new Discord.MessageEmbed()
    .setTitle(defin.word)
    .setURL(defin.urbanURL)
    .setDescription(defin.definition)
    //.addField("Example", defin.example)
    //.addField("Author", defin.author)
    .setColor(config.color);
  sMsg(message, embed);
};