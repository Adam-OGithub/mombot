const config = require("../config.json");
const { sMsg, getChannel } = require("../custom_nodemods/utils.js");
const axios = require("../node_modules/axios");
exports.run = async (client, message, discord, infoObj) => {
  const myReq = {};
  myReq.query = `SELECT prisonid FROM prison WHERE guildid = "${infoObj.guildID}"`;
  axios
    .post(config.web.dburl, myReq)
    .then((res) => {
      const out = res.data.result[0]?.prisonid;

      if (out !== undefined && out !== null) {
        sMsg(
          message.channel,
          `Sweety Pie <@${message.author.id}> I am your mother,I brought you into this world and I can take you out of it!`
        );
        sMsg(
          getChannel(out, infoObj),
          `<@${message.author.id}> you belong here`
        );
      } else {
        sMsg(
          message.channel,
          `Sweety Pie <@${message.author.id}> I am your mother,I brought you into this world and I can take you out of it!`
        );
      }
    })
    .catch((e) => {
      console.log(`${e}`);
    });
};
