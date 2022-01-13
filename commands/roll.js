"use strict";
const {
  sMsg,
  randomInt,
  getHelp,
  makeEmbed,
} = require("../custom_nodemods/utils.js");
const config = require("../config.json");

const roll = (die) => randomInt(0, die);
const addVals = (pre, cur) => BigInt(pre) + BigInt(cur);
const total = (allDice) => allDice.reduce(addVals);
const cycleRoll = (die, multi, notSingle = false, overTen) => {
  let str = ``;
  if (notSingle) {
    const diceCount = [];
    for (let i = 0; i < +multi; i++) {
      let dRoll = roll(die);
      if (i <= 10) {
        str += `Rolled: ${dRoll} \n`;
      }
      diceCount.push(dRoll);
    }
    if (overTen) {
      str += `Added other dice to total ...\n`;
    }
    str += `\nTotal: ${total(diceCount)}`;
  } else {
    str = roll(die);
  }
  return str;
};

exports.run = async (client, msg, args, discord, infoObj) => {
  if (args[0] !== undefined) {
    const lower = infoObj.msg.toLowerCase().split(" ").join("").split("d");
    const multi = lower[0].split(`${config.prefix}roll`)[1];
    const die = Number.parseInt(lower[1], 10);
    const multiDie = Number.parseInt(multi, 10);
    if (typeof die === "number" && die <= 90071992547409) {
      let str = ``;
      if (multiDie > 0 && multiDie <= 10) {
        str = cycleRoll(die, multi, true);
      } else if (multiDie > 10) {
        str = cycleRoll(die, multi, true, true);
      } else {
        str = cycleRoll(die);
      }
      const t = (overOne) => (overOne > 0 ? `s!` : `!`);
      const embed = makeEmbed(`Dice Roll${t(multi)}`, str);
      sMsg(msg.channel, embed);
    } else if (die > 90071992547409) {
      sMsg(
        msg.channel,
        `Wow there honey slow down your roll, that is to big of a number.`
      );
    } else {
      sMsg(
        msg.channel,
        `It has to be a number sweety, Does momma need to teach you how to count? https://youtu.be/_Qz68dtBiO4`
      );
    }
  } else {
    const embed = makeEmbed(`Dice Roll!`, `${randomInt(0, 100)}`);
    sMsg(msg.channel, embed);
  }
};
