'use strict';
const { SlashCommandBuilder } = require('discord.js');
const axios = require('../node_modules/axios');
const {
  sendChannelMsg,
  makeEmbed,
  randomIndex,
  reply,
} = require('../custom_node_modules/utils.js');
const { millToOz } = require('../custom_node_modules/conversions.js');
const config = require('../config.json');
const baseUrl = `https://www.thecocktaildb.com/api/json/v2/${config.mealdb.key}/`;

const getData = async suburl => {
  let response = await axios.get(baseUrl + suburl);

  return response;
};

const formatEmbed = (parsedData, dataType, subType) => {
  let embed = '';
  let ephemeral = false;
  if (dataType === 'filter' && typeof parsedData !== 'string') {
    //data type is filter
    const drinkObj = parsedData[0];
    const drinkStr = parsedData[1];
    embed = makeEmbed(
      `${drinkObj.strDrink} - ${drinkObj.strAlcoholic} - ${drinkObj.strCategory}`,
      `${drinkStr}\n\n`,
      undefined,
      undefined,
      drinkObj.strDrinkThumb
    );
  } else {
    //datatype is list
    ephemeral = true;
    if (typeof parsedData === 'string') {
      embed = makeEmbed('OOPS! I still love you!', parsedData);
    } else {
      let str = '';
      parsedData.forEach(el => {
        str += el + '\n';
      });
      embed = makeEmbed(subType, str);
    }
  }
  return [embed, ephemeral];
};

const parseData = async (responseData, dataType) => {
  let outData = '';
  const errorRes = 'Mom could not find anything for this request.';

  const detailedParse = detailedData => {
    const ingredients = [];
    const amounts = [];
    const detailObj = detailedData[0];
    let str = `${detailObj.strInstructions}\n\n__Ingredients__\n`;
    for (const entry in detailObj) {
      if (detailObj[entry] !== null && entry.startsWith('strIngredient')) {
        //
        ingredients.push(detailObj[entry]);
      } else if (detailObj[entry] !== null && entry.startsWith('strMeasure')) {
        //
        amounts.push(detailObj[entry]);
      }
    }
    ingredients.forEach((ingredient, i) => {
      let getAmount = ``;
      if (amounts[i] !== undefined) {
        const amtSplit = amounts[i].split(' ');
        if (
          amtSplit.includes('cl') ||
          amtSplit.includes('cL') ||
          amtSplit.includes('ml')
        ) {
          const number = millToOz(amounts[i].split(' ')[0]);
          getAmount = `${amounts[i]} - (${number} oz)`;
        } else if (amounts[i] !== null && amounts[i] !== '') {
          getAmount = amounts[i];
        }
      }
      str += `${ingredient}: ${getAmount}\n`;
    });
    return [detailObj, str];
  };

  const listParse = drinkData => {
    const arr = drinkData.map(el => {
      for (const entry in el) {
        return el[entry];
      }
    });
    return arr;
  };

  const filterParse = async drinkData => {
    if (drinkData === undefined || drinkData === null) {
      return errorRes;
    }
    const selectedMeal = randomIndex(drinkData);
    const detailedData = await getData('lookup.php?i=' + selectedMeal.idDrink);
    if (detailedData.status !== 200) {
      outData = errorRes;
    } else {
      const detailedDrinkData = detailedData.data.drinks;
      if (detailedDrinkData === undefined) {
        outData = errorRes;
      } else {
        const str = detailedParse(detailedDrinkData);
        outData = str;
      }
    }
    return outData;
  };

  if (responseData.status !== 200) {
    outData = errorRes;
  } else {
    const drinkData = responseData.data.drinks;
    if (drinkData === undefined) {
      outData = errorRes;
    } else {
      switch (dataType) {
        case 'list':
          outData = listParse(drinkData);
          break;
        case 'filter':
          outData = await filterParse(drinkData);
          break;
        default:
          break;
      }
    }
  }
  return outData;
};

const getDrinks = async (
  interaction,
  subCmd,
  ingredientList,
  drinkName,
  drinktype,
  glasstype
) => {
  let suburl = '';
  let dataType = '';
  let subType = '';
  switch (subCmd) {
    case 'random':
      suburl = 'random.php';
      dataType = 'filter';
      break;
    case 'category':
      suburl = 'filter.php?c=' + drinktype;
      dataType = 'filter';
      break;
    case 'ingredients':
      suburl = 'filter.php?i=' + ingredientList;
      dataType = 'filter';
      break;
    case 'name':
      suburl = 'search.php?s=' + drinkName;
      dataType = 'filter';
      break;
    case 'glass':
      suburl = 'search.php?g=' + glasstype;
      dataType = 'filter';
      break;
    case 'listcategories':
      suburl = 'list.php?c=list';
      dataType = 'list';
      subType = 'Categories';
      break;
    case 'listingredients':
      suburl = 'list.php?i=list';
      dataType = 'list';
      subType = 'Ingredients';
      break;
    case 'listglass':
      suburl = 'list.php?g=list';
      dataType = 'list';
      subType = 'Glasses';
      break;
    default:
      break;
  }
  const response = await getData(suburl);
  const data = await parseData(response, dataType);
  const [embed, isEphemeral] = formatEmbed(data, dataType, subType);
  if (isEphemeral === true) {
    reply(interaction, embed, true, true);
  } else {
    sendChannelMsg(interaction, embed);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('drink')
    .setDescription(
      'Gets a alcoholic or non-alcoholic drink based on certain criteria.'
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('random')
        .setDescription('Generates a single random drink.')
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('category')
        .setDescription('Generates a single random drink based on category.')
        .addStringOption(option =>
          option
            .setName('drinktype')
            .setDescription('Enter category type IE: Cocktail')
            .setRequired(true)
        )
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('ingredients')
        .setDescription('Generates a list of drinks from ingredients.')
        .addStringOption(option =>
          option
            .setName('list')
            .setDescription(
              'List ingredients with comma seprated values. IE: dry_vermouth,gin'
            )
            .setRequired(true)
        )
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('name')
        .setDescription('Gets a drink based on the name of the drink.')
        .addStringOption(option =>
          option
            .setName('drinkname')
            .setDescription('Enter a drink name.')
            .setRequired(true)
        )
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('glass')
        .setDescription('Gets a drink based on the glass type of the drink.')
        .addStringOption(option =>
          option
            .setName('glasstype')
            .setDescription('Enter a type of glass. IE: Cocktail_glass')
            .setRequired(true)
        )
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('listcategories')
        .setDescription('Lists all available categories.')
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('listingredients')
        .setDescription('Lists all available ingredients.')
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('listglass')
        .setDescription('Lists all available glass types.')
    ),
  async execute(interaction) {
    try {
      const subCmd = interaction.options.getSubcommand();
      const ingredientList = interaction.options.getString('list');
      const drinkName = interaction.options.getString('drinkname');
      const drinktype = interaction.options.getString('drinktype');
      const glasstype = interaction.options.getString('glasstype');
      getDrinks(
        interaction,
        subCmd,
        ingredientList,
        drinkName,
        drinktype,
        glasstype
      );
    } catch (e) {
      //error
      console.log(e);
    }
  },
};
// get a single random drink
// searc ny h list of ingredients
// random  alcoholic or non-alcoholic
// random drink by categorie
//random drink by glass
// search by name
//
//
