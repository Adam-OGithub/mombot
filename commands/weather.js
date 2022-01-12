"use strict";
const weather = require("../node_modules/openweather-apis");
const config = require("../config.json");
const { round, sMsg, makeEmbed } = require("../custom_nodemods/utils.js");
weather.setLang("en");
weather.setUnits("imperial");
weather.setAPPID(config.weatherToken);

exports.run = async (client, message, args, discord) => {
  //prevents weather from crashing
  if (args[0] !== undefined) {
    const isNum = args[0].match(/^[0-9]+$/);
    if (isNum === null) {
      weather.setCity(args[0]);
    } else if (args[0].length <= 5) {
      weather.setZipCode(+args[0]);
    }

    weather.getAllWeather(function (err, loc) {
      const weatherDes = loc?.weather[0]?.description;
      const m = loc?.main;
      const temp = m?.temp;
      const feelsLike = m?.feels_like;
      const minTemp = m?.temp_min;
      const maxTemp = m?.temp_max;
      const humidity = m?.humidity;
      const visibility = loc?.visibility / 1000;
      const city = loc?.name;
      let emote = ``;
      if (temp <= 40) {
        emote = `cold_face`;
      } else if (temp > 40 <= 55) {
        emote = `cold_sweat`;
      } else if (temp > 55 && temp <= 75) {
        emote = `smiley`;
      } else if (temp > 75 && temp <= 85) {
        emote = `upside_down`;
      } else if (temp > 85) {
        emote = `hot_face`;
      } else {
        emote = `face_with_monocle`;
      }
      const inner = `Temperature is ${round(temp)}ºF and feels like ${round(
        feelsLike
      )}ºF\n Min temp ${round(minTemp)}ºF, Max Temp ${round(
        maxTemp
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