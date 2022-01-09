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

exports.run = async (client, message, args, discord) => {
  const select = randomWord(momSayings);
  const sArr = select.split(" ");
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

  message.channel.send(sArr.join(" "));
};
