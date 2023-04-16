'use strict';
const { SlashCommandBuilder } = require('discord.js');
const axios = require('../node_modules/axios');
const {
  sendChannelMsg,
  getChannelCache,
  nullToZero,
  dateInfo,
  sendPrivateMessage,
  randomIndex,
} = require('../custom_node_modules/utils.js');
const {
  millToOz,
  gramToOz,
  kiloToLb,
} = require('../custom_node_modules/conversions.js');
const config = require('../config.json');
const baseUrl = `https://www.themealdb.com/api/json/v2/${config.mealdb.key}/`;

const getData = async suburl => {
  let response = await axios.get(baseUrl + suburl);

  return response;
};

const parseData = async (responseData, dataType) => {
  let outData = '';
  const errorRes = 'Mom could not find anything for this request.';

  const detailedParse = detailedData => {
    ///
  };

  const listParse = mealData => {
    const arr = mealData.map(el => {
      for (const entry in el) {
        return el[entry];
      }
    });
    return arr;
  };

  const filterParse = async mealData => {
    const selectedMeal = randomIndex(mealData);
    const detailedData = await getData('lookup.php?i=' + selectedMeal.idMeal);
    if (responseData.status !== 200) {
      outData = errorRes;
    } else {
      const detailedMealData = detailedData.data.meals;
      if (detailedMealData === undefined) {
        outData = errorRes;
      } else {
        const [mealObj, str] = detailedParse(detailedMealData);
      }
    }
    return outData;
  };

  const searchParse = mealData => {};

  if (responseData.status !== 200) {
    outData = errorRes;
  } else {
    const mealData = responseData.data.meals;
    if (mealData === undefined) {
      outData = errorRes;
    } else {
      switch (dataType) {
        case 'list':
          outData = listParse(mealData);
          break;
        case 'filter':
          outData = await filterParse(mealData);
          break;
        case 'search':
          outData = searchParse(mealData);
          break;
        default:
          break;
      }
    }
  }
  return outData;
};

const getFood = async (
  interaction,
  subCmd,
  ingredientList,
  mealName,
  location,
  foodtype
) => {
  let suburl = '';
  let dataType = '';
  switch (subCmd) {
    case 'random':
      suburl = 'random.php';
      break;
    case 'category':
      suburl = 'filter.php?c=' + foodtype;
      dataType = 'filter';
      break;
    case 'ingredients':
      suburl = 'filter.php?i=' + ingredientList;
      dataType = 'filter';
      break;
    case 'name':
      suburl = 'search.php?s=' + mealName;
      dataType = 'search';
      break;
    case 'location':
      suburl = 'filter.php?a=' + location;
      dataType = 'filter';
      break;
    case 'listcategories':
      suburl = 'list.php?c=list';
      dataType = 'list';
      break;
    case 'listlocations':
      suburl = 'list.php?a=list';
      dataType = 'list';
      break;
    default:
      break;
  }
  const response = await getData(suburl);
  const data = await parseData(response, dataType);
  console.log('data is this:', data);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('food')
    .setDescription('Gets food based on certain criteria.')
    .addSubcommand(subCmd =>
      subCmd.setName('random').setDescription('Generates a single random meal.')
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('category')
        .setDescription('Generates a single random meal based on category.')
        .addStringOption(option =>
          option
            .setName('foodtype')
            .setDescription('Enter category type IE: Seafood')
            .setRequired(true)
        )
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('ingredients')
        .setDescription('Generates a list of meals from ingredients.')
        .addStringOption(option =>
          option
            .setName('list')
            .setDescription(
              'List ingredients with comma seprated values. IE: carrot,onions'
            )
            .setRequired(true)
        )
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('name')
        .setDescription('Gets a meal based on the name of the meal.')
        .addStringOption(option =>
          option
            .setName('mealname')
            .setDescription('Enter a meal name.')
            .setRequired(true)
        )
    )
    .addSubcommand(subCmd =>
      subCmd
        .setName('location')
        .setDescription('Generates a single random meal based on location.')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Enter a location name.')
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
        .setName('listlocations')
        .setDescription('Lists all available locations.')
    ),
  async execute(interaction) {
    try {
      const subCmd = interaction.options.getSubcommand();
      const ingredientList = interaction.options.getString('list');
      const mealName = interaction.options.getString('mealname');
      const location = interaction.options.getString('name');
      const foodtype = interaction.options.getString('foodtype');
      getFood(
        interaction,
        subCmd,
        ingredientList,
        mealName,
        location,
        foodtype
      );
    } catch (e) {
      //error
      console.log(e);
    }
  },
};

// get a single random meal
// list all meal categories
// filter by category ie seafood
// filter by area     ie canadian
// filter by one ingredient
// filter by multiple ingredients
// by name of meal
//by first let of meal return random
//by id of meal
