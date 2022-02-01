"use strict";
const {
  sMsg,
  makeEmbed,
  getPre,
  getCommand,
  tryFail,
} = require("../custom_nodemods/utils");
exports.run = async (client, msg, args, discord) => {
  try {
    const pre = getPre();
    const codeB = "```";
    const codeH = "`";
    if (args[1] === undefined) {
      const ending = [
        {
          name: "\u2800",
          value: `Say ${codeH}${pre}help <command>${codeH} to get more information on a specific command.`,
          inline: true,
        },
      ];

      const commands = [
        {
          name: "> Utilities",
          value: `${pre}remind\n${pre}poll`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}weather`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}proxy`,
          inline: true,
        },
        {
          name: "> Information",
          value: `${pre}quote`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}dic`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}ud`,
          inline: true,
        },
        {
          name: "> Fun",
          value: `${pre}food\n${pre}coinflip\n${pre}roll`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}drink\n${pre}joke`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}meme\n${pre}animalfact`,
          inline: true,
        },
        {
          name: "> Mom Interaction",
          value: `${pre}set\n${pre}mom`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}momscode`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}help`,
          inline: true,
        },
        ...ending,
      ];
      const embed = makeEmbed(
        `Help me Mom`,
        "  Awww, momma always here to help you, sweetie. What'cha need?",
        undefined,
        undefined,
        undefined,
        commands
      );
      sMsg(msg.channel, embed);
    } else {
      let out;
      switch (args[1].toLowerCase()) {
        case "ud":
          out = `{ud} <word or phrase>\n#Gets the urban dictionary definition of the word or phrase.`;
          break;
        case "mom":
          out = `{mom}\n#Momma pep talk.Sometimes pep down.`;
          break;
        case "food":
          out = `{food}\n#Momma gonna make you some food.`;
          break;
        case "drink":
          out = `{drink}\n#Momma gonna make you a strong drink.`;
          break;
        case "weather":
          out = `{weather}\nMomma gets weather from https://openweathermap.org/api`;
          break;
        case "poll":
          out = `{poll} "question" "option 1,option 2,option 3, option 4" #Momma creates you a  poll. \n{poll} "question" "option 1,option 2,option 3, option 4" "time in seconds" #Momma creates you a poll with a timer.`;
          break;
        case "roll":
          out = `{roll} d <dice number>  or  {roll} <total dice> d <dice number>\n#Let momma roll you some dice!`;
          break;
        case "remind":
          out = `{remind} <channel/channels> <user/users> "<M>/<D>/<YYYY> <24H>:<minute>:<timezone>" "<message>" \n Example: ${pre}remind #testchannel1 #testchannel2 @MOM  @Pork  "1/21/2022 15:00:cst" "This is a test" \n#Let momma remind you!`;
          break;
        case "animalfact":
          out = `{animalfact}\n#Momma tells you some random animal facts!`;
          break;
        case "coinflip":
          out = `{coinflip}\n#Momma loves coin flips!`;
          break;
        case "joke":
          out = `{joke}\n#Momma tells jokes better than dad!`;
          break;
        case "meme":
          out = `{meme}\n#momma sees those memes...`;
          break;
        case "quote":
          out = `{quote}\n#Momma drops some quotes in the channel.`;
          break;
        case "dic":
          out = `{dic} <word>\n#Momma gets you a definition from https://od-api.oxforddictionaries.com/api`;
          break;
        case "proxy":
          out = `{proxy}\n#Momma gets you a proxy to hide in.`;
          break;
        case "momscode":
          out = `{momscode}\n#Get moms Github code!`;
          break;
        case "set":
          out = ` {set} prison #Sets prison channel.\n {set} prison_remove #Removes prison channel.\n {set} prison_role "<role name>" #Sets role used for prison.\n {set} hello #Allows to speak with other discords.\n {set} hello_remove #Removes speaking with other discords.`;
          break;
        case "help":
          out = `{help}\n#Get main menu for help.`;
          break;
        default:
          out = `Sweety you sure you have that right? Try (${pre}help mainCommand) instead.`;
          break;
      }

      const embed = makeEmbed(`Help for ${args[1]}`, `${codeB}${out}${codeB}`);
      sMsg(msg.channel, embed);
    }
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
