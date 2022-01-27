"use strict";
const { get } = require("snekfetch");
const { sMsg, makeEmbed, getPre } = require("../custom_nodemods/utils");
exports.run = async (client, msg, args, discord) => {
  const endHelp = [
    {
      label: "{momscode}",
      val: "Get moms Github code!",
    },
    {
      label: "{set}",
      val: ` prison - Sets prison channel.\n prison_remove - Removes prison channel.\n prison_role "<role name>" -Sets role used for prison.\n hello - Allows to speak with other discords.\n hello_remove - Removes speaking with other discords.`,
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
      label: "{drink}",
      val: "Momma gonna make you a strong drink.",
    },
    {
      label: "{weather}",
      val: "Momma gets weather from https://openweathermap.org/api",
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
      val: `<channel/channels> <user/users> "<M>/<D>/<YYYY> <24H>:<minute>:<timezone>" "<message>" \n Example: ${getPre()}remind #testchannel1 #testchannel2 @MOM  @Pork  "1/21/2022 15:00:cst" "This is a test" \n- Let momma remind you!`,
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
    {
      label: "{dic}",
      val: "<word> - Momma gets you a definition from https://od-api.oxforddictionaries.com/api",
    },
    {
      label: "{proxy}",
      val: " - Momma gets you a proxy to hide in.",
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
