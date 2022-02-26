"use strict";
const axios = require("../node_modules/axios");
const { animalApi, animalImageaApi } = require("../custom_nodemods/sayings.js");
const {
  sMsg,
  makeEmbed,
  randomIndex,
  capFirst,
  errHandler,
} = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    const animal = randomIndex(animalApi);
    let embed;
    axios
      .get(`https://and-here-is-my-code.glitch.me/facts/${animal}`)
      .then((res1) => {
        //
        if (animalImageaApi.includes(animal)) {
          axios
            .get(`https://and-here-is-my-code.glitch.me/img/${animal}`)
            .then((res2) => {
              embed = makeEmbed(
                `${capFirst(animal)} Fact`,
                res1.data.Link,
                undefined,
                undefined,
                res2.data.Link
              );
              sMsg(msg.channel, embed);
            })
            .catch((e) => {
              errHandler(e, infoObj);
            });
        } else {
          embed = makeEmbed(`${capFirst(animal)} Fact`, res1.data.Link);
          sMsg(msg.channel, embed);
        }
      })
      .catch((e) => {
        errHandler(e, infoObj);
      });
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
