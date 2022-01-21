const {
  randomWord,
  setTimoutMin,
  dates,
  getGuild,
  getChannel,
  sMsg,
} = require("./utils.js");
const { botStatus } = require("./sayings.js");
const config = require("../config.json");
const axios = require("../node_modules/axios");

const changeAc = async (client) => {
  const time = setTimoutMin(5);
  //sets activity for bot first
  client.user.setActivity(randomWord(botStatus));
  //sets bot activity every x minutes
  setInterval(() => {
    client.user.setActivity(randomWord(botStatus));
  }, time);
};

const reminders = async (client) => {
  const myReq = {};
  const myGuild = {};
  const time = setTimoutMin(0.1);
  setInterval(() => {
    myReq.query = `SELECT * FROM remind`;
    axios
      .post(config.web.dburl, myReq)
      .then((res) => {
        //Checks if result array is large than 0
        if (res?.data?.result !== undefined && res?.data?.result.length > 0) {
          const resArr = res?.data?.result;
          //for each object reminder do the folowing
          resArr.forEach((entry) => {
            let channelObjArr = [];
            //if object is less than current time
            if (+entry.time <= dates.epocSecs()) {
              //Gets guild object of array
              myGuild.currentGuild = getGuild(entry.guildid, client);
              let channels = entry.channels.split(" ");
              let users = entry.names.split(" ");
              //gets channel objects
              channels.forEach((channelId) => {
                channelObjArr.push(getChannel(channelId, myGuild));
              });
              //if users exists add to message
              let newMsg = `${entry.message}`;
              if (users.length > 0 && users[0] !== "") {
                console.log(users);
                users.forEach((user) => {
                  newMsg += ` <@${user}> `;
                });
              }
              //for each channel within guild object send message
              channelObjArr.forEach((obj) => {
                sMsg(obj, newMsg);
              });
              //Delete entry in database
              myReq.query = `DELETE FROM remind WHERE id = "${entry.id}"`;
              axios
                .post(config.web.dburl, myReq)
                .then((res) => {
                  //Do nothing for now
                })
                .catch((e) => {
                  console.log(`${e}`);
                });
            }
          });
        }
      })
      .catch((e) => {
        console.log(`${e}`);
      });
  }, time);
};

exports.changeAc = changeAc;
exports.reminders = reminders;
