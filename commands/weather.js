"use strict";
const config = require("../config.json");
const axios = require("../node_modules/axios");
const { round, sMsg, makeEmbed } = require("../custom_nodemods/utils.js");

const convertKToF = (K) => (K !== undefined ? ((+K - 273.15) * 9) / 5 + 32 : K);

exports.run = async (client, message, args, discord) => {
  //prevents weather from crashing
  console.log(args);
  let type = ``;
  let zipcode = ``;
  let cc = ``;
  let city = ``;
  let url = ``;
  if (args[0] !== undefined) {
    const isNum = args[0].match(/^[0-9]+$/);
    if (isNum === null) {
      city = args[0];
      type = `city`;
    } else if (args[0].length <= 5) {
      zipcode = args[0];
      type = `zip`;
    }

    if (args[1 !== undefined]) {
      cc = args[1];
    } else {
      cc = `us`;
    }

    if (type === `zip`) {
      url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},${cc}&appid=${config.weatherToken}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${config.weatherToken}`;
    }

    axios.get(`${url}`).then((res) => {
      console.log(res.data);
      const loc = res.data;
      const weatherDes = loc?.weather[0]?.description;
      const m = loc?.main;
      const temp = m?.temp;
      const feelsLike = m?.feels_like;
      const minTemp = m?.temp_min;
      const maxTemp = m?.temp_max;
      const humidity = m?.humidity;
      const visibility = loc?.visibility / 1000;
      const city = loc?.name;
      const tempF = convertKToF(temp);
      const feelsLikeF = convertKToF(feelsLike);
      const minTempF = convertKToF(minTemp);
      const maxTempF = convertKToF(maxTemp);
      let emote = ``;
      if (tempF <= 40) {
        emote = `cold_face`;
      } else if (tempF > 40 <= 55) {
        emote = `cold_sweat`;
      } else if (tempF > 55 && tempF <= 75) {
        emote = `smiley`;
      } else if (tempF > 75 && tempF <= 85) {
        emote = `upside_down`;
      } else if (tempF > 85) {
        emote = `hot_face`;
      } else {
        emote = `face_with_monocle`;
      }
      const inner = `Temperature is ${round(tempF)}ºF and feels like ${round(
        feelsLikeF
      )}ºF\n Min temp ${round(minTempF)}ºF, Max Temp ${round(
        maxTempF
      )}ºF \n Humidity is ${round(humidity)} with visibility at ${round(
        visibility
      )} Miles`;
      const embed = makeEmbed(
        `Weather for ${city} - ${weatherDes} :${emote}:`,
        inner
      );

      if (city !== undefined && m !== undefined) {
        sMsg(message, embed);
      } else {
        sMsg(
          message,
          `Momma is going to have to find you a new home,because ${args[0]} can not be found.`
        );
      }
    });
  } else {
    sMsg(message, `Darling you have to tell me a location.`);
  }
};
