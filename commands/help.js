"use strict";
const { sMsg, makeEmbed } = require("../custom_nodemods/utils");
exports.run = async (client, msg, args, discord) => {
  const help = [
    {
      label: "{help}",
      val: "Get this message.",
    },
  ];

  const commands = [
    {
      label: "{ud} <word or phrase> ",
      val: "Gets the urban dictionary definition of the word or phrase.",
    },
    {
      label: "{mom}",
      val: "Momma pep talk.",
    },
    {
      label: "{food}",
      val: "Momma gonna make you some food.",
    },
    {
      label: "{weather}",
      val: "Gets weather from https://openweathermap.org/api",
    },
    {
      label: "{poll}",
      val: `"question" "option 1,option 2,option 3, option 4"`,
    },
    {
      label: "{roll}",
      val: "d <dice number> or <total dice> d <dice number> - Let momma roll you some dice!",
    },
  ];

  const add = [...commands, ...help];
  const embed = makeEmbed(
    `Help me Mom`,
    `Awww, momma always here to help you, sweetie. What'cha need?`,
    add
  );

  sMsg(msg.channel, embed);
};
