"use strict";
const {
  sMsg,
  randomInt,
  getHelp,
  makeEmbed,
  getPre,
  tryFail,
} = require("../custom_nodemods/utils.js");

const roll = (die) => randomInt(0, die);
const addVals = (pre, cur) => BigInt(pre) + BigInt(cur);
const total = (allDice) => allDice.reduce(addVals);

//Addes comma between each section that needs a comma
const addComma = (arr) => {
  let i = 1;
  let temp = ``;
  if (arr.length !== 3) {
    arr.forEach((num, inc) => {
      if (i === 3) {
        if (inc + 1 < arr.length) {
          temp += `${num},`;
        } else {
          temp += `${num}`;
        }
        i = 1;
      } else {
        temp += `${num}`;
        i++;
      }
    });
  } else {
    temp += arr.join("");
  }
  return temp;
};

//Formats the dice to add commas
const format = (die) => {
  const dSplit = (die + " ").split("").map((i) => Number(i));
  const len = dSplit.length;
  let bb = true;
  let sub = 3;
  let str = ``;
  if (dSplit.length >= 4) {
    while (bb) {
      if (len - sub === 1) {
        const rest = dSplit.slice(1, len);
        str += `${dSplit.slice(0, 1).join("")},${addComma(rest)}`;
        bb = false;
      } else if (len - sub === 2) {
        const rest = dSplit.slice(2, len);
        str += `${dSplit.slice(0, 2).join("")},${addComma(rest)}`;
        bb = false;
      } else if (len - sub === 3) {
        const rest = dSplit.slice(3, len);
        str += `${dSplit.slice(0, 3).join("")},${addComma(rest)}`;
        bb = false;
      }
      sub += 3;
    }
  } else {
    str = die;
  }
  return str;
};

//Adding dice to output
const cycleRoll = (die, multi, notSingle = false, overTen) => {
  let str = ``;
  if (notSingle) {
    const diceCount = [];
    for (let i = 0; i < +multi; i++) {
      let dRoll = roll(die);
      if (i <= 10) {
        str += `Rolled: ${format(dRoll)} \n`;
      }
      diceCount.push(dRoll);
    }
    if (overTen) {
      str += `Added other dice to total ...\n`;
    }
    str += `\nTotal: ${format(total(diceCount))}`;
  } else {
    let dRoll = roll(die);
    str = dRoll;
  }
  return str;
};

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    if (args[1] !== undefined) {
      const lower = infoObj.msg.toLowerCase().split(" ").join("").split("d");
      const multi = lower[0].split(`${getPre()}roll`)[1];
      const die = Number.parseInt(lower[1], 10);
      const multiDie = Number.parseInt(multi, 10);

      //MAkes sure die is a number and within range
      if (typeof die === "number" && die <= 90071992547409) {
        let str = ``;
        if (multiDie !== undefined && multiDie <= 9000000) {
          if (multiDie > 0 && multiDie <= 10) {
            str = cycleRoll(die, multi, true);
          } else if (multiDie > 10) {
            str = cycleRoll(die, multi, true, true);
          }
        } else {
          str = cycleRoll(die);
        }

        const t = (overOne) => (overOne > 0 ? `s!` : `!`);
        const embed = makeEmbed(`Dice Roll${t(multi)}`, str);
        sMsg(msg.channel, embed);
      } else if (die > 90071992547409) {
        sMsg(
          msg.channel,
          `Whoa there honey slow down your roll, that is too big of a number.`
        );
      } else if (multiDie > 9000000) {
        sMsg(
          msg.channel,
          `Whoa there honey slow down your roll, that is too big of a number.`
        );
      } else {
        getHelp(msg.channel, "roll");
      }
    } else {
      const embed = makeEmbed(`Dice Roll!`, `${randomInt(0, 100)}`);
      sMsg(msg.channel, embed);
    }
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
