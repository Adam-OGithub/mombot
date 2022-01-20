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
  randomWord,
  markovChain,
  capFirst,
  sMsg,
} = require("../custom_nodemods/utils.js");

//Replaces all words with random word that meet criteria
const loopVars = (sArr) => {
  sArr.forEach((word, i) => {
    switch (word) {
      case "inGame":
        sArr[i] = randomWord(games);
        break;
      case "inDinner":
        sArr[i] = randomWord(dinner);
        break;
      case "inColdFood":
        sArr[i] = randomWord(foods);
        break;
      case "inCloths":
        sArr[i] = randomWord(clothing);
        break;
      case "inPeople":
        sArr[i] = randomWord(people);
        break;
      case "inShow":
        sArr[i] = randomWord(tvshows);
        break;
      case "inItems":
        sArr[i] = randomWord(items);
        break;

      default:
    }
  });
  return sArr.join(" ");
};

let sentArr = [];
exports.run = async (client, msg, args, discord) => {
  let loop = true;
  let i = 0;
  let str = ``;
  //loops until a unique sentence is found if no unique sentence is found uses markov chain
  while (loop) {
    let select = randomWord(momSayings);
    let sArr = select.split(" ");
    str = loopVars(sArr);
    if (sentArr.includes(str)) {
      //increase i
      i++;
    } else if (i > 75) {
      //tried 20 times just send it
      const mark = markovChain(sentArr.join(" "));
      const ran = randomWord(mark.split(".").join("").split("!"));
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
};
