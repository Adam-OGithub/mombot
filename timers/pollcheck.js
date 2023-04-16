'use strict';
const {
  mongoQuery,
  mongoDelete,
  mongoUpdate,
} = require('../custom_node_modules/mongoCon.js');
const {
  reply,
  dateInfo,
  getEmbed,
  makeEmbed,
  editEmbed,
} = require('../custom_node_modules/utils.js');
const pollCheckInterval = 1000 * 5;

const checkPolls = client => {
  try {
    setInterval(async () => {
      const guilds = await client.guilds.fetch();
      guilds.forEach(async guild => {
        const polls = await mongoQuery({ guild_id: guild.id }, 'polls');
        if (polls.length > 0) {
          //cycle through all the current polls in the guild
          polls.forEach(async poll => {
            const currentGuild = client.guilds.cache.get(poll.guild_id);
            const currentChannel = currentGuild.channels.cache.get(
              poll.channel_id
            );
            const currentPoll = await currentChannel.messages.fetch(
              poll.message_id
            );
            //Checks the poll end time and if less than or equal to current it will update the poll with results.
            let pollSeconds = poll.total_time_seconds - 5;
            const theEmbed = getEmbed(currentPoll);

            if (poll.end_time <= dateInfo.sinceEpoc()) {
              const react = currentPoll.reactions.cache;
              let voteCountArr = [];
              let multipleWinners = false;
              let winnerCount = 1;
              react.forEach((value, key) => {
                if (value.count === winnerCount) {
                  voteCountArr.push(`${key} had ${value.count} votes`);
                } else if (value.count > winnerCount) {
                  voteCountArr = [];
                  winnerCount = value.count;
                  voteCountArr.push(`${key} had ${value.count} votes`);
                }
              });
              let voteStr = '';
              if (voteCountArr.length > 1) {
                //tie
                multipleWinners = true;
                voteCountArr.forEach(el => {
                  voteStr += el + '\n';
                });
              } else {
                //winner
                voteStr += voteCountArr[0];
              }

              reply(
                currentPoll,
                makeEmbed(
                  `Poll: ${theEmbed.data.title} -- ${
                    multipleWinners === true ? 'Draw' : 'Winner'
                  }!`,
                  voteStr
                ),
                true
              );

              mongoDelete(
                {
                  $and: [
                    { guild_id: guild.id },
                    { message_id: poll.message_id },
                  ],
                },
                'polls'
              );
            } else {
              const voteSeconds = pollSeconds + 5;
              const footer = {
                text: `Total seconds left to vote: ${
                  voteSeconds >= 0 ? (voteSeconds <= 5 ? 0 : voteSeconds) : 0
                }`,
              };

              editEmbed(
                currentPoll,
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

              mongoUpdate(
                {
                  $and: [
                    { guild_id: guild.id },
                    { message_id: poll.message_id },
                  ],
                },
                {
                  $set: { total_time_seconds: pollSeconds },
                },
                'polls'
              );
            }
          });
        }
      });
    }, pollCheckInterval);
  } catch (e) {
    console.log('Check poll error:', e);
  }
};

exports.checkPolls = checkPolls;
