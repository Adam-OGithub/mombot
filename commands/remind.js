'use strict';
const { SlashCommandBuilder } = require('discord.js');
const {
  sendChannelMsg,
  getChannelCache,
  nullToZero,
  dateInfo,
  sendPrivateMessage,
} = require('../custom_node_modules/utils.js');
const { mongoInsert } = require('../custom_node_modules/mongoCon.js');
const { timeInSeconds } = require('../custom_node_modules/conversions.js');
const { makeCleanInput } = require('../custom_node_modules/security.js');

const makeReminder = async (
  interaction,
  notes,
  directMsg,
  seconds,
  minutes,
  hours,
  days,
  months
) => {
  ///TODO: make respond to user
  const cleanNotes = makeCleanInput(notes);
  const channelCache = getChannelCache(interaction);

  const totalTime =
    seconds +
    timeInSeconds('minutes', minutes) +
    timeInSeconds('hours', hours) +
    timeInSeconds('days', days) +
    timeInSeconds('months', months);

  const endTime = dateInfo.sinceEpoc() + totalTime;
  //send message visable to user created only
  const reminderSchema = {
    guild_id: interaction.guildId,
    user_id: interaction.user.id,
    channel_id: interaction.channelId,
    message_id: channelCache.lastMessageId,
    notes: cleanNotes,
    direct_message: directMsg,
    end_time: endTime,
  };
  mongoInsert(reminderSchema, 'reminders');

  if (directMsg === true) {
    //send directly to user
    sendPrivateMessage(
      interaction.user,
      `Reminder (${reminderSchema.notes}), set for ${dateInfo.epocToTime(
        endTime
      )}`
    );
  } else {
    //send to the main channel
    sendChannelMsg(
      interaction,
      `Reminder (${reminderSchema.notes}), set for ${dateInfo.epocToTime(
        endTime
      )}`,
      false,
      true
    );
  }
};

//add set reminder . remove reminder, list reminders
module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Generates a reminder.')
    .addStringOption(option =>
      option.setName('notes').setDescription('Reminder notes').setRequired(true)
    )
    .addBooleanOption(directBool =>
      directBool
        .setName('directmessage')
        .setDescription('Select true if you want a message to your DMs')
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
    ),
  async execute(interaction) {
    try {
      const notes = interaction.options.getString('notes');
      const directMsg = interaction.options.getBoolean('directmessage');
      const seconds = interaction.options.getInteger('seconds');
      const minutes = interaction.options.getInteger('minutes');
      const hours = interaction.options.getInteger('hours');
      const days = interaction.options.getInteger('days');
      const months = interaction.options.getInteger('months');
      makeReminder(
        interaction,
        notes,
        directMsg,
        nullToZero(seconds),
        nullToZero(minutes),
        nullToZero(hours),
        nullToZero(days),
        nullToZero(months)
      );
    } catch (e) {
      //error
      console.log(e);
    }
  },
};
