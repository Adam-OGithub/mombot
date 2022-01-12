"use strict";
const Discord = require("discord.js");
const weather = require("../node_modules/openweather-apis");
const config = require("../config.json");
const { round, sMsg } = require("../custom_nodemods/utils.js");
weather.setLang("en");
weather.setUnits("imperial");
weather.setAPPID(config.weatherToken);

exports.run = async (client, message, args, discord) => {
  try {
    //prevents weather from crashing
    const isNum = args[0].match(/^[0-9]+$/);
    if (isNum === null) {
      weather.setCity(args[0]);
    } else if (args[0].length <= 5) {
      weather.setZipCode(+args[0]);
    }

    weather.getAllWeather(function (err, loc) {
      const weatherDes = loc.weather[0].description;
      const m = loc.main;
      const temp = m.temp;
      const feelsLike = m.feels_like;
      const minTemp = m.temp_min;
      const maxTemp = m.temp_max;
      const humidity = m.humidity;
      const visibility = loc.visibility / 1000;
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
      let embed = new Discord.MessageEmbed()
        .setTitle(`Weather for ${loc.name} - ${weatherDes} :${emote}:`)
        .setColor(config.color)
        .setDescription(
          `Temperature is ${round(temp)}ºF and feels like ${round(
            feelsLike
          )}ºF\n Min temp ${round(minTemp)}ºF, Max Temp ${round(
            maxTemp
          )}ºF \n Humidity is ${round(humidity)} with visibility at ${round(
            visibility
          )} Miles`
        );
      sMsg(message, embed);
    });
  } catch (e) {
    console.log(`Weather error: ${e}`);
  }
};
