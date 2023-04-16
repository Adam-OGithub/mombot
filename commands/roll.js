'use strict';
const { SlashCommandBuilder } = require('discord.js');
const {
  randomInt,
  makeEmbed,
  reply,
} = require('../custom_node_modules/utils.js');
const roll = die => randomInt(0, die);
const addVals = (pre, cur) => BigInt(pre) + BigInt(cur);
const total = allDice => allDice.reduce(addVals);

//Addes comma between each section that needs a comma
const addComma = arr => {
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
    temp += arr.join('');
  }
  return temp;
};

//Formats the dice to add commas
const format = die => {
  const dSplit = (die + '').split('').map(i => Number(i));
  const len = dSplit.length;
  let bb = true;
  let sub = 3;
  let str = ``;
  if (dSplit.length >= 4) {
    while (bb) {
      if (len - sub === 1) {
        const rest = dSplit.slice(1, len);
        str += `${dSplit.slice(0, 1).join('')},${addComma(rest)}`;
        bb = false;
      } else if (len - sub === 2) {
        const rest = dSplit.slice(2, len);
        str += `${dSplit.slice(0, 2).join('')},${addComma(rest)}`;
        bb = false;
      } else if (len - sub === 3) {
        const rest = dSplit.slice(3, len);
        str += `${dSplit.slice(0, 3).join('')},${addComma(rest)}`;
        bb = false;
      }
      sub += 3;
    }
  } else {
    str = die;
  }
  return str;
};

const rollDice = (diceAmount, sideAmount) => {
  const t = overOne => (overOne > 1 ? `s!` : `!`);
  const diceArr = [];
  let str = '';
  //Gets random number of dice based on range and stores in array
  for (let i = 0; i < diceAmount; i++) {
    diceArr.push(roll(sideAmount));
  }

  //Formats the rolled string
  diceArr.forEach((die, i) => {
    if (i === 10) {
      str += 'Added other dice to total ... \n\n';
    } else if (i < 10) {
      str += 'Rolled: ' + format(die) + '\n';
    }
  });

  const totalFormatted = format(total(diceArr));
  str += 'Total: ' + totalFormatted;

  return makeEmbed('Dice Roll' + t(diceAmount), str);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls a random dice!')
    .addSubcommand(subCmd =>
      subCmd.setName('1d20').setDescription('Rolls a one 20 sided die.')
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('custom')
        .setDescription(
          'Rolls a custom number of dice and amounts of sides. IE: 1d6'
        )
        .addIntegerOption(opt1 =>
          opt1
            .setName('dice')
            .setDescription('Number of dice to roll.')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(90000)
        )
        .addIntegerOption(opt2 =>
          opt2
            .setName('sides')
            .setDescription('Number of sides on the dice')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(9007199)
        )
    ),
  async execute(interaction) {
    try {
      const cmd = interaction.options.getSubcommand();
      let diceAmount = interaction.options.getInteger('dice');
      let sideAmount = interaction.options.getInteger('sides');
      if (cmd === '1d20') {
        diceAmount = 1;
        sideAmount = 20;
      }
      const msg = rollDice(diceAmount, sideAmount);
      await reply(interaction, msg);
    } catch (e) {
      //error
    }
  },
};
