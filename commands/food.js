"use strict";
const axios = require("../node_modules/axios");
const {
  sMsg,
  makeEmbed,
  tryFail,
  randomInt,
} = require("../custom_nodemods/utils.js");
const {
  millToOz,
  gramToOz,
  kiloToLb,
} = require("../custom_nodemods/conversions.js");
const {
  country,
  category,
  ingredients,
} = require("../custom_nodemods/foodlist.js");
const config = require("../config.json");
const baseUrl = `https://www.themealdb.com/api/json/v2/${config.mealdb.key}`;
const parseData = (response) => {
  const mealObj = response.data.meals[0];
  let i = 1;
  const ingredients = [];
  const amount = [];
  for (const entry in mealObj) {
    let item = mealObj[entry];
    if (entry === `strIngredient${i}`) {
      if (item !== null && item !== "") {
        ingredients.push(mealObj[entry]);
      }
      i++;
    } else if (entry === `strMeasure${i}`) {
      if (item !== null && item !== "") {
        amount.push(mealObj[entry]);
      }
      i++;
    }

    if (i >= 20) {
      i = 1;
    }
  }
  //puts ingredients and amounts together api fix
  let str = ``;
  for (let i = 0; i < ingredients.length; i++) {
    if (amount[i] !== undefined) {
      let toStr = amount[i].toString();
      if (toStr.endsWith("ml") || toStr.endsWith("ml ")) {
        const oz = millToOz(Number.parseInt(amount[i]));
        if (oz !== "NaN") {
          amount[i] = `${amount[i]} - (${oz} oz)`;
        }
      } else if (toStr.endsWith("kg") || toStr.endsWith("kg ")) {
        const lb = kiloToLb(Number.parseInt(amount[i]));
        if (lb !== "NaN") {
          amount[i] = `${amount[i]}  - (${lb} lb)`;
        }
      } else if (
        toStr.endsWith("g") ||
        toStr.endsWith("Grams") ||
        toStr.endsWith("g ")
      ) {
        const oz = gramToOz(Number.parseInt(amount[i]));
        if (oz !== "NaN") {
          amount[i] = `${amount[i]} - (${oz} oz)`;
        }
      }
    }
    str += `${ingredients[i]}: ${amount[i]}\n`;
  }
  return [mealObj, str];
};

const sendFood = (msg, mealObj, str) => {
  let embed = makeEmbed(
    `${mealObj.strMeal} - ${mealObj.strArea} - ${mealObj.strCategory}`,
    `${mealObj.strInstructions} \n\n__Ingredients__\n ${str}`,
    undefined,
    mealObj.strSource,
    mealObj.strMealThumb
  );
  sMsg(msg.channel, embed);
};
exports.run = async (client, msg, args, discord) => {
  let url = `${baseUrl}/random.php`;
  let arg1 = args[1];
  let hasInclude = false;
  if (arg1 !== undefined) {
    arg1 = arg1.toLowerCase();

    if (country.includes(arg1)) {
      url = `${baseUrl}/filter.php?a=${arg1}`;
      hasInclude = true;
    } else if (category.includes(arg1)) {
      url = `${baseUrl}/filter.php?c=${arg1}`;
      hasInclude = true;
    }
  }

  axios
    .get(url)
    .then((response) => {
      try {
        if (arg1 !== undefined && hasInclude) {
          const mealData =
            response.data.meals[randomInt(0, response.data.meals.length)];
          axios
            .get(`${baseUrl}/lookup.php?i=${mealData.idMeal}`)
            .then((response) => {
              const [mealObj, str] = parseData(response);
              sendFood(msg, mealObj, str);
            });
        } else if (arg1 !== undefined) {
          sMsg(msg.channel, `Unable to find ${arg1}`);
        } else {
          const [mealObj, str] = parseData(response);
          sendFood(msg, mealObj, str);
        }
      } catch (e) {
        tryFail(msg.channel, e);
      }
    })
    .catch((e) => {
      console.log(e);
    });
};
