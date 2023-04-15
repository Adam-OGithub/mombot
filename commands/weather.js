const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../config.json');
const { reply, makeEmbed, round } = require('../custom_node_modules/utils.js');
const {
  degToDir,
  convertKToF,
  meterToMile,
  milToIn,
} = require('../custom_node_modules/conversions.js');
const weatherWords = {
  cold: `Momma suggest you wear a heavy coat.`,
  kindaCold: `Momma suggest a light coat.`,
  normal: `Go out an play honey momma loves this temp.`,
  kindaHot: `Momma is sweating a little, but still feeling good.`,
  hot: `Momma sweating her buttock off.`,
  reallyhot: `Holy hot balls of fire momma is staying in today. We need some water in here.`,
  windy: `I don't think we are in Kansas anymore.`,
};

const getWeather = async (location, zip) => {
  let type = ``;
  let zipcode = ``;
  let cc = ``;
  let city0 = ``;
  let url = ``;
  let proceed = true;
  let returnVal = '';
  if (zip) {
    zipcode = location;
    type = 'zip';
    url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},${cc}&appid=${config.tokens.weather}`;
  } else {
    city0 = location;
    type = 'city';
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city0}&appid=${config.tokens.weather}`;
  }

  const res = await axios.get(`${url}`).catch(e => {
    proceed = false;
    returnVal = `Momma is going to have to find you a new home,because ${arg1} can not be found.`;
  });
  const loc = res.data;
  if (proceed && loc?.name !== undefined && loc?.main !== undefined) {
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
    returnVal = makeEmbed(
      `Weather for ${city} - ${weatherDes} :${emote}:`,
      inner,
      undefined,
      googleMap
    );
  }
  return [returnVal, proceed];
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Providesthe weather update for an area.')
    .addStringOption(option =>
      option
        .setName('city')
        .setDescription('Gets weather based on a city name.')
        .setMinLength(1)
        .setMaxLength(32)
    )
    .addIntegerOption(option =>
      option
        .setName('zipcode')
        .setDescription('Gets weather based on a zipcode')
        .setMinValue(00501)
        .setMaxValue(99950)
    ),
  async execute(interaction) {
    try {
      let useZip = false;
      let location = '';
      const city = interaction.options.getString('city');
      const zip = interaction.options.getInteger('zipcode');
      if (zip !== null) {
        useZip = true;
        location = zip;
      } else {
        location = city;
      }
      const [embed, embedMsgBool] = await getWeather(location, useZip);
      await reply(interaction, embed, embedMsgBool);
    } catch (e) {
      //error
    }
  },
};
