"use strict";
const axios = require("../node_modules/axios");
const {
  sMsg,
  makeEmbed,
  errHandler,
  randomInt,
  parseQuote,
  countQuote,
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

const sendFood = (msg, mealObj, str, countFood) => {
  let embed = makeEmbed(
    `${mealObj.strMeal} - ${mealObj.strArea} - ${mealObj.strCategory}`,
    `${mealObj.strInstructions} \n\n__Ingredients__\n ${str}\n\n ***# of results ${countFood}***`,
    undefined,
    mealObj.strSource,
    mealObj.strMealThumb
  );
  sMsg(msg.channel, embed);
};

const getMulti = (infoObj) => {
  const multiArgs = parseQuote(infoObj, "food")[1];
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

exports.run = async (client, msg, args, discord, infoObj) => {
  let countFood;
  let url = `${baseUrl}/random.php`;
  let arg1 = args[1];
  let hasInclude = false;
  let argInvalid = false;
  let arr = [];
  const multiArgs = getMulti(infoObj);
  if (arg1 !== undefined) {
    arg1 = arg1.toLowerCase();

    if (multiArgs !== undefined) {
      //for each ingredient in multi argument
      multiArgs.forEach((entry) => {
        //check if ingredient  is in list if not proceed
        const enLower = entry.toLowerCase();
        if (ingredients.includes(enLower) !== true) {
          arr.push(`___Below options for ${enLower}___`);
          //split enrty to create regix
          const entrySplit = enLower.split("");
          const reg = new RegExp(
            `[${entrySplit[0]}][${entrySplit[1]}][${entrySplit[2]}]`
          );
          ingredients.forEach((ing) => {
            if (reg.test(ing)) {
              arr.push(ing);
            }
          });
          argInvalid = true;
        }
      });
      url = `${baseUrl}/filter.php?i=${multiArgs.join(`,`)}`;
      hasInclude = true;
    } else if (country.includes(arg1)) {
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
      if (response.data.meals !== null) {
        countFood = response.data.meals.length;
        try {
          if (arg1 !== undefined && hasInclude) {
            let mealData;
            if (response.data.meals.length > 1) {
              mealData =
                response.data.meals[randomInt(0, response.data.meals.length)];
            } else {
              mealData = response.data.meals[0];
            }
            axios
              .get(`${baseUrl}/lookup.php?i=${mealData.idMeal}`)
              .then((response) => {
                const [mealObj, str] = parseData(response);
                sendFood(msg, mealObj, str, countFood);
              });
          } else if (arg1 !== undefined) {
            sMsg(
              msg.channel,
              `Unable to find ${arg1},please try quoting the ingredient.`
            );
          } else {
            const [mealObj, str] = parseData(response);
            sendFood(msg, mealObj, str, countFood);
          }
        } catch (e) {
          errHandler(e, infoObj, true, msg.channel);
        }
      } else {
        if (argInvalid) {
          let outStr = ``;
          arr.forEach((entry) => {
            outStr += `${entry}\n`;
          });
          sMsg(
            msg.channel,
            `Momma suggest trying to replace your ingredients with:\n${outStr}`
          );
        } else {
          sMsg(
            msg.channel,
            `Momma can not find a recipe with all the ingredients: ${multiArgs}`
          );
        }
      }
    })
    .catch((e) => {
      errHandler(e, infoObj, true, msg.channel);
    });
};
