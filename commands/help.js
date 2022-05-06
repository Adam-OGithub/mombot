"use strict";
const {
  sMsg,
  makeEmbed,
  getPre,
  errHandler,
  argToReg,
} = require("../custom_nodemods/utils.js");
exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    const pre = getPre();
    const codeB = "```";
    const codeH = "`";
    if (args[1] === undefined) {
      const ending = [
        {
          name: "\u2800",
          value: `Say ${codeH}${pre}help <command>${codeH} to get more information on a specific command.\nCan also use any length of a command #ie: ${codeH}${pre}hel${codeH}, for help.\n\nCommand is in {}, sub command is in <>, please do not include these in the command.Anything in quotes " has to be quoted.`,
          inline: true,
        },
      ];

      const commands = [
        {
          name: "> Utilities",
          value: `${pre}remind`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}weather`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}poll`,
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
          value: `${pre}drink\n${pre}joke\n${pre}music`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}meme\n${pre}animalfact\n${pre}steam`,
          inline: true,
        },
        {
          name: "> Mom Interaction",
          value: `${pre}set\n${pre}mom`,
          inline: true,
        },
        {
          name: "\u2800",
          value: `${pre}momscode\n${pre}getinfo`,
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
      const newSelect = await argToReg(args[1], infoObj.allComs);
      switch (newSelect) {
        case "ud":
          out = `{ud} <word or phrase>\n#Gets the urban dictionary definition of the word or phrase.`;
          break;
        case "mom":
          out = `{mom}\n#Momma pep talk.Sometimes pep down.`;
          break;
        case "food":
          out = `{food} #Momma gonna make you some random food.\n{food} <type> #ie: ${pre}food seafood , momma gets you some food.\n{food} "ingredient1,ingedient2,ingedient3" #Momma checks her cookbook for those ingredients`;
          break;
        case "drink":
          out = `{drink} #Momma gonna make you a strong random drink.\n{drink} <type> #ie: ${pre}drink margarita, momma gets you a type of strong drink\n{drink} "ingredient1,ingredient2" #Momma checks her cabinet for those ingredients`;
          break;
        case "weather":
          out = `{weather} <zipcode or city name>\nMomma gets weather from https://openweathermap.org/api`;
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

        case "momscode":
          out = `{momscode}\n#Get moms Github code!`;
          break;
        case "set":
          out = ` {set} <prison> #Sets prison channel.\n {set} <prison_remove> #Removes prison channel.\n {set} <prison_role> "<role name>" #Sets role used for prison.\n {set} <hello> #Allows to speak with other discords.\n {set} <hello_remove> #Removes speaking with other discords.`;
          break;
        case "getinfo":
          out = `{getinfo}\n#Gets server information.`;
          break;
        case "music":
          out = `Important: If playing a list make sure it does not include &index=x or it will just play one song. All playlists and songs must be public or unlisted to be able to play.\n\n{play} <youtubeUrl> #Plays a video from YouTube or a list from YouTube. \n\n{add} <YouTubeUrl> #Adds a song to queue list.\n\n{skip} #Skips to the next song in the queue.\n\n{stop} #Clears queue and stops mom.\n\n{repeat} #Adds current song to next song.\n\n{queue} #Gets song info such as current,next and last.\n\n{volume} <number> #Changes the volume of mom.\n\nYou can also just use play YouTubeUrl as well for example.\n\n#MOMS music is AD FREE!`;
          break;
        case "steam":
          out = `{game name} #Momma gets steam information`;
          break;
        case "help":
          out = `{help}\n#Get main menu for help.`;
          break;

        default:
          out = `Sweety you sure you have that right? Try (${pre}help mainCommand) instead.`;
          break;
      }

      const embed = makeEmbed(
        `Help for ${newSelect}`,
        `${codeB}${out}${codeB}`
      );
      sMsg(msg.channel, embed);
    }
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
