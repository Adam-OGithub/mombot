const {
  randomIndex,
  setTimoutMin,
  dates,
  getGuild,
  getChannel,
  sMsg,
} = require("./utils.js");
const { botStatus } = require("./sayings.js");
const { mongoQuery, mongoDelete } = require("../custom_nodemods/mongoCon.js");
const changeAc = async (client) => {
  //const types = ["PLAYING", "STREAMING", "LISTENING", "WATCHING", "COMPETING"];
  const types = ["PLAYING", "COMPETING"];
  const time = setTimoutMin(20);
  //sets activity for bot first
  client.user.setActivity(randomIndex(botStatus), {
    type: randomIndex(types),
  });
  //sets bot activity every x minutes
  setInterval(() => {
    client.user.setActivity(randomIndex(botStatus), {
      type: randomIndex(types),
    });
  }, time);
};

const reminders = async (client) => {
  let query;
  const myGuild = {};
  const time = setTimoutMin(0.1);
  setInterval(() => {
    const go = async () => {
      query = { allMsgs: undefined };
      const res = await mongoQuery(query, "reminders");
      //Checks if result array is large than 0
      if (res.length > 0) {
        const resArr = res;
        //for each object reminder do the folowing
        resArr.forEach((entry) => {
          let channelObjArr = [];
          //if object is less than current time
          if (entry.time <= dates.epocSecs()) {
            //Gets guild object of array
            myGuild.currentGuild = getGuild(entry.guildId, client);
            let channels = entry.channels.split(" ");
            let users = entry.users.split(" ");
            //gets channel objects
            channels.forEach((channelId) => {
              channelObjArr.push(getChannel(channelId, myGuild));
            });
            //if users exists add to message
            let newMsg = `${entry.message}`;
            if (users.length > 0 && users[0] !== "") {
              users.forEach((user) => {
                newMsg += ` <@${user}> `;
              });
            }
            //for each channel within guild object send message
            channelObjArr.forEach((obj) => {
              sMsg(obj, newMsg);
            });
            query = {
              guildId: entry.guildId,
              posterId: entry.posterId,
              time: entry.time,
            };
            mongoDelete(query, "reminders");
          }
        });
      }
    };
    go();
  }, time);
};

exports.changeAc = changeAc;
exports.reminders = reminders;
