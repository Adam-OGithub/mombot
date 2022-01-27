"use strict";
const axios = require("../node_modules/axios");
const { sMsg, makeEmbed, capFirst } = require("../custom_nodemods/utils.js");
const config = require("../config.json");
exports.run = async (client, msg, args, discord) => {
  if (args[1] !== undefined && args[2] === undefined) {
    const options = {
      headers: {
        app_id: config.oxford.appid,
        app_key: config.oxford.key,
      },
    };
    const lowerArg = args[1].toLowerCase();
    axios
      .get(
        `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${lowerArg}`,
        options
      )
      .then((res) => {
        try {
          let mainExample = `Not found`;
          let slangExample = `Not found`;
          const fullData = res?.data?.results;
          const result1 = fullData[0]?.lexicalEntries[0];
          const mainDef = result1?.entries[0]?.senses[0];
          const slangDef = result1?.entries[0]?.senses[1];
          const mainLongDef = mainDef?.definitions[0];
          const mainShortDef = mainDef?.shortDefinitions[0];
          if (mainDef?.examples) {
            mainExample = mainDef?.examples[0]?.text;
          }
          const slangLongDef = slangDef?.definitions[0];
          const slangShortDef = slangDef?.shortDefinitions[0];
          if (slangDef?.examples) {
            slangExample = slangDef?.examples[0]?.text;
          }
          const word = result1?.text;
          const description = `**Definition:** ${capFirst(
            mainLongDef
          )}.\n\n**Short definition:** ${capFirst(
            mainShortDef
          )}.\n\n**Example:** ${capFirst(
            mainExample
          )}.\n\n**Slang definition:** ${capFirst(
            slangLongDef
          )}.\n\n**Slang short definition:** ${capFirst(
            slangShortDef
          )}.\n\n**Slang example:** ${capFirst(slangExample)}`;

          const embed = makeEmbed(
            `Here is info on ${capFirst(word)}`,
            description
          );
          sMsg(msg.channel, embed);
        } catch (e) {
          console.log(e);
        }
      })
      .catch((e) => {
        if (e?.response?.data?.error) {
          console.log(e?.response?.data?.error);
          sMsg(msg.channel, "Word not found!");
        }
      });
  } else {
    sMsg(msg.channel, "Please use a single word.");
  }
};
