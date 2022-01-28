const axios = require("../node_modules/axios");
const {
  sMsg,
  makeEmbed,
  letters,
  randomWord,
} = require("../custom_nodemods/utils.js");

const { millToOz } = require("../custom_nodemods/conversions.js");

exports.run = async (client, msg, args, discord) => {
  const randomLetter = randomWord(letters);
  axios
    .get(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${randomLetter}`
    )
    .then((res) => {
      //
      try {
        const drinks = res?.data?.drinks;
        if (res?.data?.drinks) {
          const ranD = randomWord(drinks);
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
              console.log(`(${amounts[i]})`);
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
          const embed = makeEmbed(
            ranD.strDrink,
            str,
            undefined,
            `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${ranD.idDrink}`,
            ranD.strDrinkThumb
          );
          sMsg(msg.channel, embed);
        }
      } catch (e) {
        tryFail(msg.channel, e);
        sMsg(msg.channel, "Unable to get you a drink..");
      }
    })
    .catch((e) => {
      console.log(e);
    });
};
