"use strict";
const {
  emotes,
  capFirst,
  makeEmbed,
  getHelp,
  parseQuote,
  countQuote,
  parseRplc,
  errHandler,
  randomIndex,
  getPre,
  emObj,
  getEmbed,
} = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    const count = countQuote(infoObj);
    //Makes sure there are only 4 quotes
    if (count === 4 || count === 6) {
      //easier split for quates
      const arg0 = args[0].split(`${getPre()}`)[1];
      const fArgs = parseQuote(infoObj, arg0);
      const question = fArgs[1];
      const options = fArgs[3].split(",");
      const time = fArgs[5];
      let str = ``;
      const newEmoteArr = [];
      const optionMsg = [];
      options.forEach((obj, i) => {
        const randomEmote = () => {
          const selectArr = emotes.filter((emote) => {
            if (newEmoteArr.includes(emote) !== true) {
              return emote;
            }
          });
          return randomIndex(selectArr);
        };
        const currentEmote = randomEmote();
        newEmoteArr.push(currentEmote);
        str += `${currentEmote} - ${capFirst(obj)}\n\n`;
        optionMsg.push(`${currentEmote} - ${capFirst(obj)}\n\n`);
      });

      const embed = makeEmbed(parseRplc(question, client, infoObj), `${str}`);

      msg.channel.send(emObj(embed)).then((sent) => {
        newEmoteArr.forEach((entry) => {
          sent.react(entry);
        });
        if (time !== "" && time !== " " && time !== undefined) {
          let i = 60;
          i = +time;
          //Sets interval to update message
          const updateMsg = setInterval(() => {
            // const embed2 = makeEmbed(
            //   parseRplc(question, client, infoObj),
            //   `${str} \n Time Left to vote ${(i += -5)} seconds`
            // );
            const embedMsg = getEmbed(sent);
            embedMsg.description = `${str} \n Time Left to vote ${(i +=
              -5)} seconds`;

            sent.edit(emObj(embedMsg));
            if (i <= 0) {
              clearInterval(updateMsg);
            }
          }, 5000);

          //Gets results
          setTimeout(() => {
            let winner = 1;
            const winnerObj = {};
            const react = sent.reactions.cache;
            react.forEach((value, key) => {
              if (value.count > winner) {
                winner = value.count;
                winnerObj.winner = value;
              }
            });
            //Need to fix for multi winners above 1 etc..
            const finalEmbed = getEmbed(sent);

            if (winner === 1) {
              finalEmbed.description = `${str} \nIt is a Draw!`;
            } else {
              let finalMsg = ``;
              optionMsg.forEach((msg) => {
                if (msg.split(" ").includes(winnerObj.winner._emoji.name)) {
                  finalMsg = msg;
                }
              });
              finalEmbed.description = `${str} \nWinner is ${winnerObj.winner._emoji.name}\n${finalMsg}`;
            }
            sent.edit(emObj(finalEmbed));
          }, i * 1000 + 2000);
        }
      });
      //end msg.send
    } else {
      getHelp(msg.channel, "poll");
    }
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
