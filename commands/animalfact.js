"use strict";
const axios = require("../node_modules/axios");
const { animalApi, animalImageaApi } = require("../custom_nodemods/sayings.js");
const {
  sMsg,
  makeEmbed,
  randomIndex,
  capFirst,
  glitchApi,
  errHandler,
} = require("../custom_nodemods/utils.js");

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    const animal = randomIndex(animalApi);
    let response2 = true;
    let embed;
    const response1 = await glitchApi(true, "facts/" + animal).catch((e) => {
      //
    });
    if (animalImageaApi.includes(animal)) {
      response2 = await glitchApi(true, "img/" + animal).catch((e) => {
        //
      });
    }

    if (response2?.data?.Link) {
      embed = makeEmbed(
        capFirst(animal) + ` Fact`,
        response1.data.Link,
        undefined,
        undefined,
        response2.data.Link
      );
      sMsg(msg.channel, embed);
    } else {
      embed = makeEmbed(capFirst(animal) + ` Fact`, response1?.data?.Link);
      sMsg(msg.channel, embed);
    }
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
