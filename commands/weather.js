"use strict";
const config = require("../config.json");
const axios = require("../node_modules/axios");
const { round, sMsg, makeEmbed } = require("../custom_nodemods/utils.js");
const { weatherWords } = require("../custom_nodemods/sayings.js");

const convertKToF = (K) =>
  K !== undefined
    ? ((+K - 273.15) * 9) / 5 + 32
    : `Your guess is as good as mine.`;

const meterToMile = (M) =>
  M !== undefined
    ? `${(M * 2.236936).toFixed(2)}/mph`
    : `Your guess is as good as mine.`;
const milToIn = (M) => (M !== undefined ? (M * 0.03937).toFixed(2) : 0);
const degToDir = (deg) => {
  let dir = ``;
  if (deg !== undefined) {
    if (deg >= 360 || (deg > 0 && deg <= 44)) {
      dir = `North`;
    } else if (deg >= 45 && deg <= 89) {
      dir = `North East`;
    } else if (deg >= 90 && deg <= 134) {
      dir = `East`;
    } else if (deg >= 135 && deg <= 179) {
      dir = `South East`;
    } else if (deg >= 180 && deg <= 224) {
      dir = `South`;
    } else if (deg >= 225 && deg <= 269) {
      dir = `South West`;
    } else if (deg >= 270 && deg <= 314) {
      dir = `West`;
    } else if (deg >= 315 && deg <= 359) {
      dir = `North West`;
    }
  } else {
    dir = deg;
  }
  return dir;
};
exports.run = async (client, msg, args, discord) => {
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

    if (args[1] !== undefined) {
      cc = args[1];
    } else {
      cc = `us`;
    }

    if (type === `zip`) {
      url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},${cc}&appid=${config.tokens.weather}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${config.tokens.weather}`;
    }

    axios
      .get(`${url}`)
      .then((res) => {
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
        const windSpeed = meterToMile(loc?.wind?.speed);
        const windDirection = degToDir(loc?.wind?.deg);
        const windGust = meterToMile(loc?.wind?.gust);
        const precip = milToIn(loc?.precipitation?.precipitation.value);
        const typeOfPrecip = loc?.precipitation?.precipitation.mode;
        const tempF = convertKToF(temp);
        const feelsLikeF = convertKToF(feelsLike);
        const minTempF = convertKToF(minTemp);
        const maxTempF = convertKToF(maxTemp);
        let isRainOrSnow = ``;
        let mommaInput = ``;
        if (typeOfPrecip !== undefined) {
          isRainOrSnow = `Curently ${typeOfPrecip} with ${precip} in last hour.`;
        }

        if (windSpeed > 13) {
          mommaInput += `${weatherWords.windy} \n`;
        }
        let emote = ``;
        if (tempF <= 40) {
          emote = `cold_face`;
          mommaInput += weatherWords.cold;
        } else if (tempF > 40 <= 55) {
          emote = `cold_sweat`;
          mommaInput += weatherWords.kindaCold;
        } else if (tempF > 55 && tempF <= 75) {
          emote = `smiley`;
          mommaInput += weatherWords.normal;
        } else if (tempF > 75 && tempF <= 85) {
          emote = `upside_down`;
          mommaInput += weatherWords.kindaHot;
        } else if (tempF > 85 && tempF <= 94) {
          emote = `hot_face`;
          mommaInput += weatherWords.hot;
        } else if (tempF >= 95) {
          emote = `hot_face`;
          mommaInput += weatherWords.reallyhot;
        } else {
          emote = `face_with_monocle`;
        }
        const inner = `Temperature is ${round(tempF)}ºF and feels like ${round(
          feelsLikeF
        )}ºF\n Min temp ${round(minTempF)}ºF, Max Temp ${round(
          maxTempF
        )}ºF \n Humidity is ${round(humidity)} with visibility at ${round(
          visibility
        )} Miles \n Wind direction is ${windDirection} at Speed of ${windSpeed} and gust of ${windGust} \n ${isRainOrSnow}\n ${mommaInput}`;
        const embed = makeEmbed(
          `Weather for ${city} - ${weatherDes} :${emote}:`,
          inner
        );

        if (city !== undefined && m !== undefined) {
          sMsg(msg.channel, embed);
        } else {
          sMsg(
            msg.channel,
            `Momma is going to have to find you a new home,because ${args[0]} can not be found.`
          );
        }
      })
      .catch((e) => {
        if (e?.response?.data?.message === "city not found") {
          sMsg(
            msg.channel,
            `Momma is going to have to find you a new home,because ${args[0]} can not be found.`
          );
        }
      });
  } else {
    sMsg(message, `Darling you have to tell me a location.`);
  }
};
