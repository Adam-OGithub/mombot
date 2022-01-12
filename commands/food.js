"use strict";
const axios = require("../node_modules/axios");
const config = require("../config.json");
const Discord = require("discord.js");
const { sMsg } = require("../custom_nodemods/utils");
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
      let embed = new Discord.MessageEmbed()
        .setTitle(
          `${mealObj.strMeal} - ${mealObj.strArea} - ${mealObj.strCategory}`
        )
        .setURL(mealObj.strSource)
        .setImage(mealObj.strMealThumb)
        .setColor(config.color)
        .setDescription(
          `${mealObj.strInstructions} \n\n__Ingredients__\n ${str}`
        );

      sMsg(message, embed);
    });
};
