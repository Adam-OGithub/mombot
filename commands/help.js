"use strict";
const { sMsg, makeEmbed } = require("../custom_nodemods/utils");
exports.run = async (client, message, args, discord) => {
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
      val: "create <pollname> <question> - Creates poll\n add <pollname> <q1,q2,q3,q4> - Adds questions\nstart <pollname> - Starts poll",
    },
    {
      label: "{roll}",
      val: "d <1000> - Let momma roll you some dice!",
    },
  ];

  const add = [...commands, ...help];
  const embed = makeEmbed(
    `Help me Mom`,
    `Awww, momma always here to help you, sweetie. What'cha need?`,
    add
  );

  sMsg(message, embed);
};
