"use strict";
const Discord = require("discord.js");
const config = require("../config.json");
exports.run = async (client, message, args, discord) => {
  let embed = new Discord.MessageEmbed()
    .setTitle(`Help me Mom`)
    .setColor(config.color)
    .setDescription(
      `Awww, momma always here to help you, sweetie. What'cha need?`
    )
    .addField(
      "{ud} <word or phrase> ",
      "Gets the urban dictionary definition of the word or phrase."
    )
    .addField("{mom}", "Momma pep talk.")
    .addField("{food}", "Momma gonna make you some food.")
    .addField("{weather}", "Gets weather from https://openweathermap.org/api")
    .addField("{help}", "Get this message.");
  message.channel.send(embed);
};
