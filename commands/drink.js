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
      const drinks = res?.data?.drinks;
      if (res?.data?.drinks) {
        const ranD = randomWord(drinks);
        const ingredients = [];
        const amounts = [];
        let str = `${ranD.strInstructions}\n`;
        for (const entry in ranD) {
          console.log(`Entry=${entry}`);
          console.log(`valis=${ranD[entry]}`);
          if (ranD[entry] !== null && entry.startsWith("strIngredient")) {
            //
            ingredients.push(ranD[entry]);
            console.log(`add ingredients`);
          } else if (ranD[entry] !== null && entry.startsWith("strMeasure")) {
            //
            amounts.push(ranD[entry]);
            console.log(`add amount`);
          }
        }
        console.log(`ingredients =${ingredients}`);
        console.log(`amounts =${amounts}`);
        ingredients.forEach((ingredient, i) => {
          let getAmount = ``;
          if (amounts[i] !== undefined) {
            if (amounts[i].endsWith("cl")) {
              const number = millToOz(amounts[i].split(" ")[0]);
              getAmount = `${number} oz`;
            } else {
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
    })
    .catch((e) => {
      console.log(e);
    });
};
