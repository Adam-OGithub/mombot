'use strict';
const { SlashCommandBuilder } = require('discord.js');
const config = require('../config.json');
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
  sendPrivateMessage,
  getAuthor,
  getEmbed,
  editEmbed,
} = require('../custom_node_modules/utils.js');
const { mongoInsert } = require('../custom_node_modules/mongoCon.js');
const { timeInSeconds } = require('../custom_node_modules/conversions.js');
const { makeCleanInput } = require('../custom_node_modules/security.js');

const sendPrivate = async (interaction, userId, message) => {
  const author = await getAuthor(interaction.client, userId);
  sendPrivateMessage(author, message);
};

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

const makeAnonPoll = async (interaction, question, options) => {
  //
  let returnVal = '';
  let embedBool = true;
  let emoteArr = '';
  let endingWinner = '';
  const optionArr = options.split(',');
  if (optionArr.length <= 1) {
    returnVal =
      'Only one option provided or not seperated by commas, poll not created.';
    embedBool = false;
  } else {
    let [str, newEmoteArr, optionMsg] = setEmbed(optionArr);
    returnVal = makeEmbed('Anon Poll: ' + question, str);
    emoteArr = newEmoteArr;
  }

  if (embedBool) {
    // reply(interaction, returnVal);
    sendChannelMsg(interaction, returnVal);
    //timeout is set to 500ms after message is sent to make sure laster message id is the poll
    setTimeout(async () => {
      let voteCount = 0;
      // seconds // minutes // hours
      //60 * 60 * 3;
      let pollTime = 60 * 60 * 3;
      let futureEpocTime = dateInfo.sinceEpoc() + pollTime;
      const collectorEmojis = new Map();
      const usersVoted = [];
      const channelCache = getChannelCache(interaction);
      const lastMsg = await getLastMsg(channelCache);
      emoteArr.forEach(el => {
        lastMsg.react(el);
      });

      reply(
        interaction,
        `Your poll has been created and will be active until ${dateInfo.epocToTime(
          futureEpocTime
        )}!`,
        false,
        true
      );

      //On poll start * 1000 for milliseconds pollTime * 1000,
      const collector = lastMsg.createReactionCollector({
        time: 15000,
      });

      collector.on('collect', (reaction, user) => {
        let userId = user.id;
        let emoji = reaction.emoji.name;
        let currentWinner = '';

        if (
          userId !== config.momBotId &&
          userId !== config.testing.devBotId &&
          !usersVoted.includes(userId)
        ) {
          //Push user to array to only allow one vote per user
          usersVoted.push(userId);
          //removes reaction
          lastMsg.reactions.resolve(emoji).users.remove(userId);
          //Sets emoji to array
          if (collectorEmojis.has(emoji)) {
            let emojiEntry = collectorEmojis.get(emoji);
            let newCount = ++emojiEntry.count;
            collectorEmojis.set(emoji, { count: newCount });
          } else {
            collectorEmojis.set(emoji, { count: 1 });
          }

          const theEmbed = getEmbed(lastMsg);
          let currentValue = 0;
          for (let [key, value] of collectorEmojis.entries()) {
            if (currentValue < value.count) {
              currentWinner = key;
              currentValue = value.count;
            }
          }

          const sentenceResult = theEmbed.data.description
            .split('\n')
            .map(sentence => {
              let splitSentence = sentence.split(' ');
              for (let i = 0; i < splitSentence.length; i++) {
                if (splitSentence[i] == currentWinner) {
                  return sentence;
                }
              }
            });
          endingWinner = sentenceResult.join('');
          const footer = {
            text: `Total votes: ${++voteCount}, Current winner is "${endingWinner}" with ${currentValue} ${
              currentValue === 1 ? 'vote' : 'votes'
            }.`,
          };

          editEmbed(
            lastMsg,
            makeEmbed(
              theEmbed.data.title,
              theEmbed.data.description,
              undefined,
              undefined,
              undefined,
              undefined,
              footer
            )
          );

          sendPrivate(
            interaction,
            userId,
            `Thank you for voting on the poll "${question}". Your answer ${emoji} has been submitted.`
          );
        } else if (usersVoted.includes(userId)) {
          lastMsg.reactions.resolve(emoji).users.remove(userId);

          sendPrivate(
            interaction,
            userId,
            `You have already voted on the poll "${question}".`
          );
        } else {
          //nothing for now
        }
      });

      // On poll end
      collector.on('end', collected => {
        //mention the poll
        sendChannelMsg(
          interaction,
          `Poll "${question}" has ended with winner "${endingWinner}".`,
          false
        );
      });
    }, 600);
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
        .setName('anonymous')
        .setDescription('Generates a poll that is anonymous.')
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
      } else if (subCmd === 'anonymous') {
        const question = interaction.options.getString('question');
        const options = interaction.options.getString('options');
        makeAnonPoll(interaction, question, options);
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
