"use strict";
const config = require("../config.json");
const axios = require("../node_modules/axios");
const {
  round,
  sMsg,
  makeEmbed,
  errHandler,
} = require("../custom_nodemods/utils.js");
const {
  convertKToF,
  meterToMile,
  milToIn,
} = require("../custom_nodemods/conversions.js");
const { weatherWords } = require("../custom_nodemods/sayings.js");

//converts degree to direction
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
exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    //prevents weather from crashing
    let type = ``;
    let zipcode = ``;
    let cc = ``;
    let city1 = ``;
    let url = ``;
    const arg1 = args[1];
    const arg2 = args[2];
    if (arg1 !== undefined) {
      const isNum = arg1.match(/^[0-9]+$/);
      if (isNum === null) {
        city1 = arg1;
        type = `city`;
      } else if (arg1.length <= 5) {
        zipcode = arg1;
        type = `zip`;
      }

      if (arg2 !== undefined) {
        cc = arg2;
      } else {
        cc = `us`;
      }
      //sets url based on zip else it chooses city
      if (type === `zip`) {
        url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},${cc}&appid=${config.tokens.weather}`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city1}&appid=${config.tokens.weather}`;
      }
      let proceed = true;
      const res = await axios.get(`${url}`).catch((e) => {
        proceed = false;
        sMsg(
          msg.channel,
          `Momma is going to have to find you a new home,because ${arg1} can not be found.`
        );
      });

      if (proceed) {
        console.log(`=========================`);
        const loc = res.data;
        const weatherDes = loc?.weather[0]?.description;
        const lon = loc?.coord?.lon;
        const lat = loc?.coord?.lat;
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
        const googleMap = `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lon}`;
        //Sets rain if there is rain
        if (typeOfPrecip !== undefined) {
          isRainOrSnow = `Curently ${typeOfPrecip} with ${precip} in last hour.`;
        }
        //Picks Windy word if speed is greater that 13
        if (windSpeed > 13) {
          mommaInput += `${weatherWords.windy} \n`;
        }
        //Sets emote to be used based on temperature
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
        //Sets imbed
        const inner = `Temperature is ${round(tempF)}ºF and feels like ${round(
          feelsLikeF
        )}ºF\n Min temp ${round(minTempF)}ºF, Max Temp ${round(
          maxTempF
        )}ºF \n Humidity is ${round(humidity)} with visibility at ${round(
          visibility
        )} Miles \n Wind direction is ${windDirection} at Speed of ${windSpeed} and gust of ${windGust} \n ${isRainOrSnow}\n ${mommaInput}`;
        const embed = makeEmbed(
          `Weather for ${city} - ${weatherDes} :${emote}:`,
          inner,
          undefined,
          googleMap
        );

        if (city !== undefined && m !== undefined) {
          sMsg(msg.channel, embed);
        } else {
          sMsg(
            msg.channel,
            `Momma is going to have to find you a new home,because ${arg1} can not be found.`
          );
        }
      }
    } else {
      sMsg(message, `Darling you have to tell me a location.`);
    }
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
