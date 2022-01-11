"use strict";
const randomWord = (arr) => arr[Math.trunc(Math.random() * arr.length)];

const round = (myInt) => Math.trunc(myInt);

const markovMe = (input) => {
  const markovChain = {};
  const textArr = input.split(" ");
  for (let i = 0; i < textArr.length; i++) {
    let word = textArr[i].toLowerCase().replace(/[\W_]/, "");
    if (!markovChain[word]) {
      markovChain[word] = [];
    }
    if (textArr[i + 1]) {
      markovChain[word].push(textArr[i + 1].toLowerCase().replace(/[\W_]/, ""));
    }
  }
  const words = Object.keys(markovChain);
  let word = words[Math.floor(Math.random() * words.length)];
  let result = "";
  for (let i = 0; i < words.length; i++) {
    result += word + " ";
    let newWord =
      markovChain[word][Math.floor(Math.random() * markovChain[word].length)];
    word = newWord;
    if (!word || !markovChain.hasOwnProperty(word))
      word = words[Math.floor(Math.random() * words.length)];
  }
  return result;
};

const capFirst = (str) =>
  str !== undefined
    ? str[0].toUpperCase() + str.slice(1)
    : `Mom still loves you honey, even though you were born an error`;

const emotes = [
  "🐶",
  "🐺",
  "🐷",
  "🐱",
  "🦁",
  "🐯",
  "🦒",
  "🦊",
  "🦝",
  "🐮",
  "🐗",
  "🐭",
  "🐹",
  "🐰",
  "🐻",
  "🐨",
  "🐼",
  "🐸",
  "🦓",
  "🐴",
  "🦄",
  "🐔",
  "🐲",
  "🦍",
  "🐖",
  "🦨",
  "🐳",
  "🐠",
  "🐟",
];

const sMsg = (
  mainObj,
  mainMsg,
  react = false,
  arr,
  reply = false,
  bot = false,
  msg
) => {
  // el.channel.send(arg);
  mainObj.channel.send(mainMsg).then((sent) => {
    if (react) {
      if (arr !== undefined) {
        arr.forEach((entry) => {
          sent.react(`${entry}`);
        });
      }
    } else if (reply && msg !== undefined) {
      if (bot) {
        sent.reply(msg);
      } else {
        mainObj.reply(msg);
      }
    }
  });
};

exports.randomWord = randomWord;
exports.round = round;
exports.markovChain = markovMe;
exports.capFirst = capFirst;
exports.emotes = emotes;
exports.sMsg = sMsg;
