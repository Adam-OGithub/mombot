'use strict';
const {
  REST,
  Routes,
  Client,
  Collection,
  GatewayIntentBits,
} = require('discord.js');
const fs = require('node:fs');
const config = require('./config.json');
const {
  getToken,
  getCommandPath,
} = require('./custom_node_modules/security.js');

const gBits = GatewayIntentBits;
//Permissions for the bot
const client = new Client({
  intents: [
    gBits.Guilds,
    gBits.GuildMessages,
    gBits.MessageContent,
    gBits.GuildMembers,
    gBits.GuildEmojisAndStickers,
    gBits.GuildVoiceStates,
    gBits.GuildMessageReactions,
    gBits.GuildMessageTyping,
    gBits.GuildWebhooks,
    gBits.DirectMessages,
    gBits.DirectMessageTyping,
  ],
});

client.commands = new Collection();

const commandDeploy = (token, clientId, comPath) => {
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

  const deleteCommands = (clientId, guildId) => {
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

  const setCommands = async (clientId, guildId) => {
    // Development for one guild
    console.log(
      `Setting commands for clientId: ${clientId} in guildId: ${guildId}`
    );
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
  };
  // and deploy your commands!
  (async () => {
    try {
      console.log(
        `Started refreshing ${commands.length} application (/) commands.`
      );

      if (config.testing.usedev) {
        // Development for one guild
        deleteCommands(clientId, config.testing.guildId);
        setCommands(clientId, config.testing.guildId);
      } else {
        //Production sets commaands for all guilds not just test
        const guildIds = client.guilds.cache.map(guild => guild.id);
        guildIds.forEach(guildId => {
          deleteCommands(clientId, guildId);
          setCommands(clientId, guildId);
        });
      }
    } catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error(error);
    }
  })();
};

//Deploys commands for the respective bot
client.on('ready', async () => {
  commandDeploy(getToken(), client.user.id, getCommandPath());
});

//Logins the
client.login(getToken());
