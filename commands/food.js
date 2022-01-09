"use strict";
const axios = require("../node_modules/axios");
const config = require("../config.json");
const Discord = require("discord.js");
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
      const out = `${mealObj.strMeal} - ${mealObj.strArea} - ${mealObj.strCategory}`;
      const apple = `${mealObj.strInstructions}`;
      console.log(`-==========`);
      console.log(out.length);
      console.log(out);
      console.log(`-==========`);
      console.log(apple.length);
      console.log(apple);
      console.log(`-==========`);
      console.log(str.length);
      console.log(str);
      console.log(`-==========`);
      let embed = new Discord.MessageEmbed()
        .setTitle(
          `${mealObj.strMeal} - ${mealObj.strArea} - ${mealObj.strCategory}`
        )
        .setColor(config.color)
        .setDescription(`${mealObj.strInstructions}`);
      const sL = str.length;
      if (sL <= 256) {
        embed.addField(str);
      } else if (sL > 256 && sL <= 512) {
        embed.addField(`${str.slice(0, sL / 2)}`);
        embed.addField(`${str.slice(sL / 2 + 1, sL)}`);
      } else if (sL > 512 && sL <= 768) {
        embed.addField(`${str.slice(0, sL / 3)}`);
        embed.addField(`${str.slice(sL / 3 + 1, (sL / 3) * 2)}`);
        embed.addField(`${str.slice((sL / 3) * 2 + 1, sL)}`);
      } else {
        embed.addField(`${str.slice(0, sL / 8)}`);
        embed.addField(`${str.slice(sL / 8, (sL / 8) * 2)}`);
        embed.addField(`${str.slice((sL / 8) * 2 + 1, (sL / 8) * 3)}`);
        embed.addField(`${str.slice((sL / 8) * 3 + 1, (sL / 8) * 4)}`);
        embed.addField(`${str.slice((sL / 8) * 4 + 1, (sL / 8) * 5)}`);
        embed.addField(`${str.slice((sL / 8) * 5 + 1, (sL / 8) * 6)}`);
        embed.addField(`${str.slice((sL / 8) * 6 + 1, (sL / 8) * 7)}`);
        embed.addField(`${str.slice((sL / 8) * 7, sL)}`);
        //greate than 1024
      }

      if (str.length > 2048) {
        embed = `WOW that is a long recipe better pick another one`;
      }

      embed.fields.forEach((obj) => {
        obj.value = "___________________________";
      });
      message.channel.send(embed);
    });
};
