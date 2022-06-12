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
const axios = require("../node_modules/axios");
const config = require("../config.json");
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

const foodObj = async () => {
  const time = 60 * 1000 * 60 * 10;
  const updateFood = async () => {
    const baseUrl = `https://www.themealdb.com/api/json/v2/${config.mealdb.key}`;
    const fType = await axios.get(baseUrl + "/list.php?i=list");
    const fCatgory = await axios.get(baseUrl + "/list.php?c=list");
    const fCountry = await axios.get(baseUrl + "/list.php?a=list");
    let foodTypes = [];
    let categorys = [];
    let countries = [];
    let mealTypes = fType?.data?.meals;
    let mealCat = fCatgory?.data?.meals;
    let mealCountry = fCountry?.data?.meals;
    if (
      mealTypes !== undefined &&
      mealCat !== undefined &&
      mealCountry !== undefined &&
      mealTypes.length > 0 &&
      mealCat.length > 0 &&
      mealCountry.length > 0
    ) {
      mealTypes.forEach((typeObj) => {
        foodTypes.push(typeObj?.strIngredient);
      });

      mealCat.forEach((catObj) => {
        categorys.push(catObj?.strCategory);
      });

      mealCountry.forEach((countObj) => {
        countries.push(countObj?.strArea);
      });
      exports.ingredients = foodTypes;
      exports.category = categorys;
      exports.country = countries;
    }
  };

  await updateFood();
  setInterval(() => {
    updateFood();
  }, time);
};

exports.changeAc = changeAc;
exports.reminders = reminders;
exports.foodObj = foodObj;
