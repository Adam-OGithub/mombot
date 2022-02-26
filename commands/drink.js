"use strict";
const axios = require("../node_modules/axios");
const {
  sMsg,
  makeEmbed,
  letters,
  randomIndex,
  errHandler,
  parseQuote,
  countQuote,
} = require("../custom_nodemods/utils.js");
const config = require("../config.json");
const { millToOz } = require("../custom_nodemods/conversions.js");
const e = require("express");
const baseUrl = `https://www.thecocktaildb.com/api/json/v2/${config.mealdb.key}`;

const sendDrink = (msg, ranD, str, allDrinksArr) => {
  const embed = makeEmbed(
    ranD.strDrink,
    str + `\n\n***#of results ${allDrinksArr.length}***`,
    undefined,
    undefined,
    ranD.strDrinkThumb
  );
  sMsg(msg.channel, embed);
};

const getMulti = (infoObj, cmd) => {
  const multiArgs = parseQuote(infoObj, cmd)[1];
  const counts = countQuote(infoObj);
  if (counts === 2 && multiArgs !== undefined) {
    const mutliArgSplit = multiArgs.split(",");
    const multiArgsMod = mutliArgSplit.map((entry) => {
      if (entry.startsWith(" ")) {
        const entrySlice = entry.slice(1, entry.length);
        return entrySlice.split(" ").join("_");
      } else {
        return entry.split(" ").join("_");
      }
    });
    return multiArgsMod;
  }
};

const parseData = (msg, ranD, allDrinksArr) => {
  const ingredients = [];
  const amounts = [];
  let str = `${ranD.strInstructions}\n\n__Ingredients__\n`;
  for (const entry in ranD) {
    if (ranD[entry] !== null && entry.startsWith("strIngredient")) {
      //
      ingredients.push(ranD[entry]);
    } else if (ranD[entry] !== null && entry.startsWith("strMeasure")) {
      //
      amounts.push(ranD[entry]);
    }
  }
  ingredients.forEach((ingredient, i) => {
    let getAmount = ``;
    if (amounts[i] !== undefined) {
      const amtSplit = amounts[i].split(" ");
      if (
        amtSplit.includes("cl") ||
        amtSplit.includes("cL") ||
        amtSplit.includes("ml")
      ) {
        const number = millToOz(amounts[i].split(" ")[0]);
        getAmount = `${amounts[i]} - (${number} oz)`;
      } else if (amounts[i] !== null && amounts[i] !== "") {
        getAmount = amounts[i];
      }
    }
    str += `${ingredient}: ${getAmount}\n`;
  });
  sendDrink(msg, ranD, str, allDrinksArr);
};

const error = (msg) => {
  sMsg(msg.channel, "Unable to get you a drink..");
};
exports.run = async (client, msg, args, discord, infoObj) => {
  const randomLetter = randomIndex(letters);
  const multiArgs = getMulti(infoObj, "drink");
  let url = `${baseUrl}/search.php?f=${randomLetter}`;

  if (args[1] !== undefined && multiArgs !== undefined) {
    url = `${baseUrl}/filter.php?i=${multiArgs.join(`,`)}`;
  } else if (args[1] !== undefined) {
    url = `${baseUrl}/search.php?s=${args[1]}`;
  }
  axios
    .get(url)
    .then((res) => {
      //
      try {
        if (res?.data?.drinks) {
          const drinks = res?.data?.drinks;
          const ranD = randomIndex(drinks);
          if (args[1] !== undefined && multiArgs !== undefined) {
            url = `${baseUrl}/lookup.php?i=${ranD.idDrink}`;
            axios.get(url).then((res) => {
              if (res?.data?.drinks) {
                parseData(msg, res.data.drinks[0], res.data.drinks);
              } else {
                error(msg);
              }
            });
          } else if (args[1] !== undefined) {
            url = `${baseUrl}/lookup.php?i=${ranD.idDrink}`;
            axios.get(url).then((res) => {
              if (res?.data?.drinks) {
                parseData(msg, res.data.drinks[0], res.data.drinks);
              } else {
                error(msg);
              }
            });
          } else {
            parseData(msg, ranD, res.data.drinks);
          }
        } else {
          error(msg);
        }
      } catch (e) {
        errHandler(e, infoObj);
        error(msg);
      }
    })
    .catch((e) => {
      errHandler(e, infoObj, true, msg.channel);
    });
};
