"use strict";
const axios = require("../node_modules/axios");
const { sMsg, makeEmbed } = require("../custom_nodemods/utils");
exports.run = async (client, message, args, discord) => {
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
        str += `${ingredients[i]}: ${amount[i]}\n`;
      }

      let embed = makeEmbed(
        `${mealObj.strMeal} - ${mealObj.strArea} - ${mealObj.strCategory}`,
        `${mealObj.strInstructions} \n\n__Ingredients__\n ${str}`,
        undefined,
        mealObj.strSource,
        mealObj.strMealThumb
      );
      sMsg(message, embed);
    });
};
