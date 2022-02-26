"use strict";
const {
  momSayings,
  clothing,
  foods,
  dinner,
  games,
  tvshows,
  items,
  people,
} = require("../custom_nodemods/sayings.js");
const {
  randomIndex,
  markovChain,
  capFirst,
  sMsg,
  randomInt,
  errHandler,
} = require("../custom_nodemods/utils.js");
const axios = require("../node_modules/axios");
//Replaces all words with random word that meet criteria
const loopVars = (sArr) => {
  sArr.forEach((word, i) => {
    switch (word) {
      case "inGame":
        sArr[i] = randomIndex(games);
        break;
      case "inDinner":
        sArr[i] = randomIndex(dinner);
        break;
      case "inColdFood":
        sArr[i] = randomIndex(foods);
        break;
      case "inCloths":
        sArr[i] = randomIndex(clothing);
        break;
      case "inPeople":
        sArr[i] = randomIndex(people);
        break;
      case "inShow":
        sArr[i] = randomIndex(tvshows);
        break;
      case "inItems":
        sArr[i] = randomIndex(items);
        break;

      default:
    }
  });
  return sArr.join(" ");
};

let sentArr = [];
exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    const ranInt = randomInt(0, 10);
    let loop = true;
    let i = 0;
    let str = ``;
    if (ranInt < 6) {
      //loops until a unique sentence is found if no unique sentence is found uses markov chain
      while (loop) {
        let select = randomIndex(momSayings);
        let sArr = select.split(" ");
        str = loopVars(sArr);
        if (sentArr.includes(str)) {
          //increase i
          i++;
        } else if (i > 75) {
          //tried 20 times just send it
          const mark = markovChain(sentArr.join(" "));
          const ran = randomIndex(mark.split(".").join("").split("!"));
          const str = `${capFirst(ran)}.`;
          sMsg(msg.channel, str);
          sentArr = [];
          loop = false;
        } else {
          //not in list
          sentArr.push(str);
          sMsg(msg.channel, str);
          loop = false;
        }
      }
    } else {
      axios.get("http://www.madsci.org/cgi-bin/lynn/jardin/SCG").then((res) => {
        const resArr = res.data.split("\n");
        const content = resArr
          .slice(resArr.indexOf(`<h2>`) + 2, resArr.indexOf(`</h2>`))
          .join(" ");
        console.log(resArr);
        sMsg(msg.channel, content);
      });
    }
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
