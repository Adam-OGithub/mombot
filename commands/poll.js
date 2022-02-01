"use strict";
const { clearCookie } = require("express/lib/response");
const {
  emotes,
  capFirst,
  sMsg,
  makeEmbed,
  getHelp,
  parseQuote,
  countQuote,
  parseRplc,
  tryFail,
  getChannel,
  getLastMsg,
} = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    const count = countQuote(infoObj);
    //Makes sure there are only 4 quotes
    if (count === 4 || count === 6) {
      //easier split for quates
      const fArgs = parseQuote(infoObj, "poll");
      console.log(fArgs);
      const question = fArgs[1];
      const options = fArgs[3].split(",");
      const time = fArgs[5];
      let str = ``;
      const newEmoteArr = [];
      const optionMsg = [];
      options.forEach((obj, i) => {
        newEmoteArr.push(emotes[i]);
        str += `${emotes[i]} - ${capFirst(obj)}\n\n`;
        optionMsg.push(`${emotes[i]} - ${capFirst(obj)}\n\n`);
      });

      const embed = makeEmbed(parseRplc(question, client, infoObj), `${str}`);
      // sMsg(msg.channel, embed, true, newEmoteArr);
      msg.channel.send(embed).then((sent) => {
        newEmoteArr.forEach((entry) => {
          sent.react(entry);
        });
        console.log(time);
        if (time !== "" && time !== " " && time !== undefined) {
          let i = 60;
          i = +time;
          //Sets interval to update message
          const updateMsg = setInterval(() => {
            const embed2 = makeEmbed(
              parseRplc(question, client, infoObj),
              `${str} \n Time Left to vote ${(i += -5)} seconds`
            );
            sent.edit(embed2);
            if (i <= 0) {
              clearInterval(updateMsg);
            }
          }, 5000);

          //Gets results need to fix for multi winners
          setTimeout(() => {
            let winner = 0;
            const winnerObj = {};
            const react = sent.reactions.cache;
            react.forEach((value, key) => {
              if (value.count > winner) {
                winner = value.count;
                winnerObj.winner = value;
              }
            });
            let finalMsg = ``;
            optionMsg.forEach((msg) => {
              if (msg.split(" ").includes(winnerObj.winner._emoji.name)) {
                finalMsg = msg;
              }
            });

            const embed3 = makeEmbed(
              parseRplc(question, client, infoObj),
              `Winner is ${winnerObj.winner._emoji.name}\n${finalMsg}`
            );
            sent.edit(embed3);
          }, i * 1000 + 2000);
        }
      }); //end msg.send
    } else {
      getHelp(msg.channel, "poll");
    }
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
