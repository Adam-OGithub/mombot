"use strict";
const axios = require("../node_modules/axios");
const { sMsg, makeEmbed } = require("../custom_nodemods/utils");
const millToOz = (mil) => (mil !== undefined ? mil * 0.033814 : mil);
const gramToOz = (gram) => (gram !== undefined ? gram * 0.03527396195 : gram);
const kiloToLb = (kilo) => (kilo !== undefined ? kilo * 2.20462262185 : kilo);
exports.run = async (client, msg, args, discord) => {
  axios
    .get("https://www.themealdb.com/api/json/v1/1/random.php")
    .then((response) => {
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
          const oz = millToOz(Number.parseInt(amount[i])).toFixed(2);
          if (oz !== "NaN") {
            amount[i] = `${amount[i]} - (${oz} oz)`;
          }
        } else if (
          toStr.endsWith("g") ||
          toStr.endsWith("Grams") ||
          toStr.endsWith("g ")
        ) {
          const oz = gramToOz(Number.parseInt(amount[i])).toFixed(2);
          if (oz !== "NaN") {
            amount[i] = `${amount[i]} - (${oz} oz)`;
          }
        } else if (toStr.endsWith("kg") || toStr.endsWith("kg ")) {
          const lb = kiloToLb(Number.parseInt(amount[i])).toFixed(2);
          if (lb !== "NaN") {
            amount[i] = `${amount[i]}  - (${lb} lb)`;
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
    })
    .catch((e) => {
      console.log(e);
    });
};
