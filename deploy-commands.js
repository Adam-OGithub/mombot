'use strict';
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const config = require(`./config.json`);
const {
  mongoQuery,
  mongoInsert,
} = require('./custom_node_modules/mongoCon.js');
const commandDeploy = (token, clientId, guildId, comPath) => {
  const commands = [];
  // Grab all the command files from the commands directory you created earlier
  const commandFiles = fs
    .readdirSync(`./${comPath}`)
    .filter(file => file.endsWith('.js'));
  console.log('Command files:', commandFiles);
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const command = require(`./${comPath}/${file}`);
    commands.push(command.data.toJSON());
  }
  // Construct and prepare an instance of the REST module
  const rest = new REST({ version: '10' }).setToken(token);

  const deleteCommands = () => {
    // for all guild-based commands
    rest
      .put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
      .then(() => console.log('Successfully deleted all guild commands.'))
      .catch(console.error);

    // for all global commands
    rest
      .put(Routes.applicationCommands(clientId), { body: [] })
      .then(() => console.log('Successfully deleted all application commands.'))
      .catch(console.error);
  };
  // and deploy your commands!
  (async () => {
    try {
      deleteCommands();
      let data = '';
      console.log(
        `Started refreshing ${commands.length} application (/) commands.`
      );

      // The put method is used to fully refresh all commands in the guild with the current set
      // if (config.testing.usedev) {
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      // } else {
      //   data = await rest.put(Routes.applicationCommands(clientId), {
      //     body: commands,
      //   });
      // }
      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
      );
      //TODO: Later will be used to store id of command and refresh when needed - currently discord does not support getting the uuid of the command.
      // data.forEach(async el => {
      //   const insertData = {
      //     guild_id: el.guild_id,
      //     command: el.name,
      //     description: el.description,
      //     options_length: el.options.length,
      //   };
      //   console.log(insertData);
      //   const res = await mongoInsert(insertData, 'registered_commands');
      //   if (res.acknowledged) {
      //     console.log('Command registered to database');
      //   } else {
      //     console.log('Command not registered to database');
      //   }
      // });
    } catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error(error);
    }
  })();
};

exports.commandDeploy = commandDeploy;
