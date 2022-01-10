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
const { randomWord } = require("../custom_nodemods/utils.js");

const loopVars = (sArr) => {
  sArr.forEach((word, i) => {
    if (word === "inGame") {
      sArr[i] = randomWord(games);
    } else if (word === "inDinner") {
      sArr[i] = randomWord(dinner);
    } else if (word === "inColdFood") {
      sArr[i] = randomWord(foods);
    } else if (word === "inCloths") {
      sArr[i] = randomWord(clothing);
    } else if (word === "inPeople") {
      sArr[i] = randomWord(people);
    } else if (word === "inShow") {
      sArr[i] = randomWord(tvshows);
    } else if (word === "inItems") {
      sArr[i] = randomWord(items);
    } else {
      //do nothing
    }
  });
  return sArr.join(" ");
};

let sentArr = [];
exports.run = async (client, message, args, discord) => {
  let loop = true;
  let i = 0;
  let str = ``;
  while (loop) {
    let select = randomWord(momSayings);
    let sArr = select.split(" ");
    str = loopVars(sArr);
    if (sentArr.includes(str)) {
      //increase i
      i++;
    } else if (i > 30) {
      //tried 20 times just send it
      loop = false;
      sentArr = [];
    } else {
      //not in list
      sentArr.push(str);
      loop = false;
    }
  }
  message.channel.send(str);
};
