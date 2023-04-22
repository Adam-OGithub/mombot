'use strict';
const { SlashCommandBuilder } = require('discord.js');
const {
  emotes,
  capFirst,
  makeEmbed,
  randomIndex,
  sendChannelMsg,
  reply,
  getChannelCache,
  getLastMsg,
  dateInfo,
  nullToZero,
} = require('../custom_node_modules/utils.js');
const { mongoInsert } = require('../custom_node_modules/mongoCon.js');
const { timeInSeconds } = require('../custom_node_modules/conversions.js');
const { makeCleanInput } = require('../custom_node_modules/security.js');

const setEmbed = optionArr => {
  let str = ``;
  const newEmoteArr = [];
  const optionMsg = [];
  //Sets emotes with options
  optionArr.forEach(optionStr => {
    const cleanString = makeCleanInput(optionStr);
    const randomEmote = () => {
      const selectArr = emotes.filter(emote => {
        if (newEmoteArr.includes(emote) !== true) {
          return emote;
        }
      });
      return randomIndex(selectArr);
    };
    const currentEmote = randomEmote();
    newEmoteArr.push(currentEmote);
    str += currentEmote + ' - ' + capFirst(cleanString) + '\n\n';
    optionMsg.push(currentEmote + ' - ' + capFirst(cleanString));
  });
  return [str, newEmoteArr, optionMsg];
};

const makePoll = async (interaction, question, options) => {
  //
  let returnVal = '';
  let embedBool = true;
  let emoteArr = '';
  const optionArr = options.split(',');
  if (optionArr.length <= 1) {
    returnVal =
      'Only one option provided or not seperated by commas, poll not created.';
    embedBool = false;
  } else {
    let [str, newEmoteArr, optionMsg] = setEmbed(optionArr);
    returnVal = makeEmbed(question, str);
    emoteArr = newEmoteArr;
  }

  if (embedBool) {
    reply(interaction, returnVal);
    //timeout is set to 500ms after message is sent to make sure laster message id is the poll
    setTimeout(async () => {
      const channelCache = getChannelCache(interaction);
      const lastMsg = await getLastMsg(channelCache);
      emoteArr.forEach(el => {
        lastMsg.react(el);
      });
    }, 500);
  } else {
    //need to reply visable to only end user
  }
};

const makeTimedPoll = async (
  interaction,
  question,
  options,
  seconds,
  minutes,
  hours,
  days,
  months
) => {
  //
  let returnVal = '';
  let embedBool = true;
  let emoteArr = '';
  let pollOptions = '';
  let totalTime = 0;
  const optionArr = options.split(',');
  if (optionArr.length <= 1) {
    returnVal =
      'Only one option provided or not seperated by commas, poll not created.';
    embedBool = false;
  } else {
    totalTime =
      seconds +
      timeInSeconds('minutes', minutes) +
      timeInSeconds('hours', hours) +
      timeInSeconds('days', days) +
      timeInSeconds('months', months);

    let [str, newEmoteArr, optionMsg] = setEmbed(optionArr, totalTime);
    returnVal = makeEmbed(
      question,
      str,
      undefined,
      undefined,
      undefined,
      undefined,
      { text: 'Total seconds left to vote: ' + totalTime }
    );
    emoteArr = newEmoteArr;
    pollOptions = optionMsg;
  }

  if (embedBool) {
    reply(interaction, returnVal);
    //timeout is set to 500ms after message is sent to make sure laster message id is the poll
    setTimeout(async () => {
      const channelCache = getChannelCache(interaction);
      const lastMsg = await getLastMsg(channelCache);
      emoteArr.forEach(el => {
        lastMsg.react(el);
      });

      const endTime = dateInfo.sinceEpoc() + totalTime;

      const pollSchema = {
        guild_id: interaction.guildId,
        user_id: interaction.user.id,
        channel_id: interaction.channelId,
        message_id: channelCache.lastMessageId,
        options: pollOptions,
        emotes: emoteArr,
        total_time_seconds: totalTime,
        end_time: endTime,
      };
      //stores in database to later use in pollcheck.js
      mongoInsert(pollSchema, 'polls');
    }, 500);
  } else {
    //need to reply visable to only end user
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Generates a poll.')
    .addSubcommand(subCmd =>
      subCmd
        .setName('normal')
        .setDescription('Generates a poll without a timer.')
        .addStringOption(option =>
          option
            .setName('question')
            .setDescription('Ask a question')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('options')
            .setDescription(
              'Provide options sperated by commas. IE: dog,cow,frog'
            )
            .setRequired(true)
        )
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('timed')
        .setDescription('Generates a poll a timer.')
        .addStringOption(option =>
          option
            .setName('questions')
            .setDescription('Ask a question')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('options')
            .setDescription(
              'Provide options sperated by commas. IE: dog,cow,frog'
            )
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('seconds')
            .setDescription('Enter a set amount of seconds.')
            .setMinValue(10)
            .setMaxValue(216000)
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('minutes')
            .setDescription('Enter a set amount of minutes.')
            .setMinValue(1)
            .setMaxValue(1440)
        )
        .addIntegerOption(option =>
          option
            .setName('hours')
            .setDescription('Enter a set amount of hours.')
            .setMinValue(1)
            .setMaxValue(720)
        )
        .addIntegerOption(option =>
          option
            .setName('days')
            .setDescription('Enter a set amount of days.')
            .setMinValue(1)
            .setMaxValue(365)
        )
        .addIntegerOption(option =>
          option
            .setName('months')
            .setDescription('Enter a set amount of months.')
            .setMinValue(1)
            .setMaxValue(12)
        )
    ),

  async execute(interaction) {
    try {
      const subCmd = interaction.options.getSubcommand();
      if (subCmd === 'normal') {
        const question = interaction.options.getString('question');
        const options = interaction.options.getString('options');
        makePoll(interaction, question, options);
      } else {
        const question = interaction.options.getString('questions');
        const options = interaction.options.getString('options');
        const seconds = interaction.options.getInteger('seconds');
        const minutes = interaction.options.getInteger('minutes');
        const hours = interaction.options.getInteger('hours');
        const days = interaction.options.getInteger('days');
        const months = interaction.options.getInteger('months');
        makeTimedPoll(
          interaction,
          question,
          options,
          nullToZero(seconds),
          nullToZero(minutes),
          nullToZero(hours),
          nullToZero(days),
          nullToZero(months)
        );
      }
    } catch (e) {
      //error
    }
  },
};
