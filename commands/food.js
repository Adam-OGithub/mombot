'use strict';
const { SlashCommandBuilder } = require('discord.js');
const axios = require('../node_modules/axios');
const {
  sendChannelMsg,
  makeEmbed,
  randomIndex,
  reply,
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

const formatEmbed = (parsedData, dataType, subType) => {
  let embed = '';
  let ephemeral = false;
  if (dataType === 'filter' && typeof parsedData !== 'string') {
    //data type is filter
    const mealObj = parsedData[0];
    const mealStr = parsedData[1];
    embed = makeEmbed(
      `${mealObj.strMeal} - ${mealObj.strArea} - ${mealObj.strCategory}`,
      `${mealObj.strInstructions} \n\n__Ingredients__\n ${mealStr}\n\n`,
      undefined,
      undefined,
      mealObj.strMealThumb
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
    ///
    const mealObj = detailedData[0];
    let i = 1;
    const ingredients = [];
    const amount = [];
    for (const entry in mealObj) {
      let item = mealObj[entry];
      if (entry === `strIngredient${i}`) {
        if (item !== null && item !== '') {
          ingredients.push(mealObj[entry]);
        }
        i++;
      } else if (entry === `strMeasure${i}`) {
        if (item !== null && item !== '') {
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
        if (toStr.endsWith('ml') || toStr.endsWith('ml ')) {
          const oz = millToOz(Number.parseInt(amount[i]));
          if (oz !== 'NaN') {
            amount[i] = `${amount[i]} - (${oz} oz)`;
          }
        } else if (toStr.endsWith('kg') || toStr.endsWith('kg ')) {
          const lb = kiloToLb(Number.parseInt(amount[i]));
          if (lb !== 'NaN') {
            amount[i] = `${amount[i]}  - (${lb} lb)`;
          }
        } else if (
          toStr.endsWith('g') ||
          toStr.endsWith('Grams') ||
          toStr.endsWith('g ')
        ) {
          const oz = gramToOz(Number.parseInt(amount[i]));
          if (oz !== 'NaN') {
            amount[i] = `${amount[i]} - (${oz} oz)`;
          }
        }
      }
      str += `${ingredients[i]}: ${amount[i]}\n`;
    }
    return [mealObj, str];
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
    if (mealData === undefined || mealData === null) {
      return errorRes;
    }
    const selectedMeal = randomIndex(mealData);
    const detailedData = await getData('lookup.php?i=' + selectedMeal.idMeal);
    if (detailedData.status !== 200) {
      outData = errorRes;
    } else {
      const detailedMealData = detailedData.data.meals;
      if (detailedMealData === undefined) {
        outData = errorRes;
      } else {
        const [mealObj, str] = detailedParse(detailedMealData);
        outData = [mealObj, str];
      }
    }
    return outData;
  };

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
  let subType = '';
  switch (subCmd) {
    case 'random':
      suburl = 'random.php';
      dataType = 'filter';
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
      dataType = 'filter';
      break;
    case 'location':
      suburl = 'filter.php?a=' + location;
      dataType = 'filter';
      break;
    case 'listcategories':
      suburl = 'list.php?c=list';
      dataType = 'list';
      subType = 'Categories';
      break;
    case 'listlocations':
      suburl = 'list.php?a=list';
      dataType = 'list';
      subType = 'Locations';
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
