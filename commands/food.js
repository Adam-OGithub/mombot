"use strict";
const axios = require("../node_modules/axios");
const { sMsg, makeEmbed, tryFail } = require("../custom_nodemods/utils.js");
const {
  millToOz,
  gramToOz,
  kiloToLb,
} = require("../custom_nodemods/conversions.js");

exports.run = async (client, msg, args, discord) => {
  axios
    .get("https://www.themealdb.com/api/json/v1/1/random.php")
    .then((response) => {
      try {
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
          str += `${ingredients[i]}: ${amount[i]}\n`;
        }

        let embed = makeEmbed(
          `${mealObj.strMeal} - ${mealObj.strArea} - ${mealObj.strCategory}`,
          `${mealObj.strInstructions} \n\n__Ingredients__\n ${str}`,
          undefined,
          mealObj.strSource,
          mealObj.strMealThumb
        );
        sMsg(msg.channel, embed);
      } catch (e) {
        tryFail(msg.channel, e);
      }
    })
    .catch((e) => {
      console.log(e);
    });
};
