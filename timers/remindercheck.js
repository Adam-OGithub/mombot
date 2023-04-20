'use strict';
const {
  mongoQuery,
  mongoDelete,
} = require('../custom_node_modules/mongoCon.js');
const {
  dateInfo,
  sendChannelMsgNoInteraction,
  getAuthor,
  sendPrivateMessage,
  getChannelFromClient,
} = require('../custom_node_modules/utils.js');
const reminderCheckInterval = 1000 * 10;
const checkReminders = client => {
  try {
    setInterval(async () => {
      const guilds = await client.guilds.fetch();
      guilds.forEach(async guild => {
        const reminders = await mongoQuery({ guild_id: guild.id }, 'reminders');
        if (reminders.length > 0) {
          reminders.forEach(async reminder => {
            const currentChannel = getChannelFromClient(
              client,
              reminder.guild_id,
              reminder.channel_id
            );
            if (reminder.end_time <= dateInfo.sinceEpoc()) {
              if (reminder.direct_message === true) {
                //Send user a direct message
                const author = await getAuthor(client, reminder.user_id);
                sendPrivateMessage(author, reminder.notes);
                mongoDelete({ message_id: reminder.message_id }, 'reminders');
              } else {
                //Send to channel use submitted in
                sendChannelMsgNoInteraction(
                  currentChannel,
                  reminder.notes,
                  false
                );
                mongoDelete({ message_id: reminder.message_id }, 'reminders');
              }
            }
          });
        }
      });
    }, reminderCheckInterval);
  } catch (e) {
    console.log('Check reminder error:', e);
  }
};

exports.checkReminders = checkReminders;
