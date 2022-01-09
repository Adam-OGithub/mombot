"use strict";
const Discord = require("discord.js");
const weather = require("../node_modules/openweather-apis");
const config = require("../config.json");
const { round } = require("../custom_nodemods/utils.js");
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
      let embed = new Discord.MessageEmbed()
        .setTitle(`Weather for ${loc.name}`)
        .setColor(config.color)
        .setDescription(
          `Temperature is ${round(loc.main.temp)}ºF and feels like ${round(
            loc.main.feels_like
          )}ºF\n Min temp ${round(loc.main.temp_min)}ºF, Max Temp ${round(
            loc.main.temp_max
          )}ºF \n Humidity is ${round(loc.main.humidity)}`
        );
      message.channel.send(embed);
    });
  } catch (e) {
    console.log(`Weather error: ${e}`);
  }
};
