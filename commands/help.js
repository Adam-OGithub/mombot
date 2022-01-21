"use strict";
const { get } = require("snekfetch");
const { sMsg, makeEmbed, getPre } = require("../custom_nodemods/utils");
exports.run = async (client, msg, args, discord) => {
  const endHelp = [
    {
      label: "{set}",
      val: "prison - Sets prison channel,\n prison_remove - Removes prison channel, \n hello - Allows to speak with other discords, \nhello_remove - Removes speaking with other discords. ",
    },
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
      val: "Momma pep talk.Sometimes pep down.",
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
    {
      label: "{remind}",
      val: `<channel> <users> "<M>/<D>/<YYYY> <24H>:<minute>:<timezone>" "<message>" \n Example: ${getPre()}remind #testchannel @MOM  @Pork  "1/21/2022 15:00:cst" "This is a test" \n- Let momma remind you!`,
    },
    {
      label: "{animalfacts}",
      val: "Momma tells you some random animal facts!",
    },
    {
      label: "{coinflip}",
      val: "Momma loves coin flips!",
    },
    {
      label: "{joke}",
      val: "Momma tells jokes better than dad!",
    },
    {
      label: "{meme}",
      val: "Momma sees those memes...",
    },
    {
      label: "{quote}",
      val: "Momma drops some quotes in the channel.",
    },
  ];

  const add = [...commands, ...endHelp];
  const embed = makeEmbed(
    `Help me Mom`,
    `Awww, momma always here to help you, sweetie. What'cha need?`,
    add
  );

  sMsg(msg.channel, embed);
};
