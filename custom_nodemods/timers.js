const {
  randomWord,
  setTimoutMin,
  dates,
  getGuild,
  getChannel,
  sMsg,
  makeEmbed,
} = require("./utils.js");
const { botStatus } = require("./sayings.js");
const config = require("../config.json");
const axios = require("../node_modules/axios");

const changeAc = async (client) => {
  //const types = ["PLAYING", "STREAMING", "LISTENING", "WATCHING", "COMPETING"];
  const types = ["PLAYING", "COMPETING"];
  const time = setTimoutMin(20);
  //sets activity for bot first
  client.user.setActivity(randomWord(botStatus), {
    type: randomWord(types),
  });
  //sets bot activity every x minutes
  setInterval(() => {
    client.user.setActivity(randomWord(botStatus), {
      type: randomWord(types),
    });
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
                  //do nothing
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

// const playstation5 = async (client) => {
//   const infoObj = {};
//   infoObj.currentGuild = getGuild(config.ps5.guildId, client);
//   const chan = getChannel(config.ps5.guildId, infoObj);
//   let todayPs5 = [];
//   let urls = [];
//   let info = [];
//   let count = 0;
//   let sendMsg = true;

//   const getInfo = () => {
//     axios
//       .get("https://www.techradar.com/deals/live/ps5-restock-live-blog")
//       .then((res) => {
//         try {
//           const data = res.data.split(`id="section-ps5-restock-quick-links-us`);
//           const splitDataMore = data[1].split(
//             `id="section-ps5-restock-quick-link-uk"`
//           );
//           const dataMore = splitDataMore[0].split(
//             `data-widget-type="contentparsed"`
//           )[0];
//           const splitLi = dataMore.split(`</li>`);

//           splitLi.forEach((el) => {
//             let splitEl = el.split(" ");
//             if (splitEl.includes("today")) {
//               todayPs5.push(el);
//             }
//           });
//           todayPs5.forEach((entry) => {
//             const link = entry.split(`href="`)[1].split(`"`)[0];
//             const getWords = entry.split(`<strong>`);
//             const words = getWords[getWords.length - 1].split("</strong>")[0];
//             urls.push(link);
//             info.push(words);
//           });

//           urls.forEach((url, i) => {
//             let embed = makeEmbed(
//               "PS5 Available!",
//               `${info[i]} \n https://www.techradar.com/deals/live/ps5-restock-live-blog \n <@${infoObj.currentGuild.ownerID}>`,
//               undefined,
//               url
//             );

//             if (count === 1 && sendMsg) {
//               sendMsg = false;
//               setTimeout(() => {
//                 count = 0;
//                 sendMsg = true;
//               }, setTimoutMin(840));
//             } else if (count === 0) {
//               if (urls.length > 0) {
//                 sMsg(chan, embed);
//                 count = 1;
//               }
//             }

//             todayPs5 = [];
//             urls = [];
//             info = [];
//           });
//         } catch (e) {
//           console.log(e);
//         }
//       })
//       .catch((e) => {
//         console.log(e);
//       });
//   };
//   //get info right away
//   getInfo();
//   setInterval(() => {
//     getInfo(); //delay info
//   }, setTimoutMin(240));
// };
exports.changeAc = changeAc;
exports.reminders = reminders;
// exports.playstation5 = playstation5;
