"use strict";
const axios = require("../node_modules/axios");
const { animalApi, animalImageaApi } = require("../custom_nodemods/sayings.js");
const {
  sMsg,
  makeEmbed,
  randomWord,
  capFirst,
} = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord) => {
  const animal = randomWord(animalApi);
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
            console.log(e);
          });
      } else {
        console.log("hit not res");
        embed = makeEmbed(`${capFirst(animal)} Fact`, res1.data.Link);
        sMsg(msg.channel, embed);
      }
    })
    .catch((e) => {
      console.log(e);
    });
};
