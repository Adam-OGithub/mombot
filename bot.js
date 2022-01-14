"use strict";
const Discord = require("discord.js");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config.json");
const client = new Discord.Client();
const app = express();
const { botStatus } = require("./custom_nodemods/sayings.js");
const {
  randomWord,
  markovChain,
  sMsg,
  capFirst,
  genInfo,
  dates,
  getChannel,
  getPre,
} = require("./custom_nodemods/utils.js");
const minutes = 5;
const seconds = minutes * 60;
const time = seconds * 1000;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const con = mysql.createConnection({
  host: config.sql.host,
  user: config.sql.username,
  password: config.sql.password,
  database: config.sql.database,
  timeout: config.sql.timeout,
});

const changeAc = async () => {
  //sets activity for bot first
  client.user.setActivity(randomWord(botStatus));
  //sets bot activity every x minutes
  setInterval(() => {
    client.user.setActivity(randomWord(botStatus));
  }, time);
};

app.post(config.web.url, async (req, res) => {
  const reqB = req.body;
  con.connect(function (err) {
    if (err) throw err;
    con.query(reqB.query, function (err, result) {
      if (err) throw err;
      res.json(result);
      con.end();
    });
  });
});

//sets server app to listen
app.listen(config.web.port, () => {
  console.log("Server is Ready!");
});

//Start Bot log
client.on("ready", () => {
  console.log(`\x1b[32m`, `${client.user.tag} is online!`);
  changeAc();
});

const getUserFromMention = (mention) => {
  if (!mention) return;

  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }

    if (client.users.cache.get(mention) === undefined) {
      //returns bot object
      return client.user;
    } else {
      //returns user object
      return client.users.cache.get(mention);
    }
  }
};
const myConf = {};
if (config.testing.usedev) {
  myConf.token = config.tokens.dev;
} else {
  myConf.token = config.tokens.prod;
}

client.on("message", (message) => {
  // const userMention = getUserFromMention(message.content);
  if (message.content.indexOf(getPre()) === 0) {
    const args = message.content.slice(getPre().length).trim().split(" ");
    const command = args.shift().toLowerCase();
    try {
      console.log(`\x1b[32m`, `${message.author.tag} executed '${command}'`);
      let runCommand = require(`./commands/${command}.js`);
      runCommand.run(client, message, args, Discord, genInfo(message, client));
    } catch (e) {
      console.error(`\x1b[32m`, `[ERROR]: ${e.message}`);
    }
  } else if (message.mentions.everyone) {
    const info = genInfo(message, client);
    if (info.guildID === config.prisonGuild) {
      sMsg(
        message.channel,
        `Sweety Pie <@${message.author.id}> I am your mother,I brought you into this world and I can take you out of it!`
      );
      sMsg(
        getChannel(config.prison, info),
        `<@${message.author.id}> you belong here`
      );
    } else {
      sMsg(
        message.channel,
        `Sweety Pie <@${message.author.id}> I am your mother,I brought you into this world and I can take you out of it!`
      );
    }
  }

  // else if (
  //   userMention?.bot &&
  //   userMention?.username === "MOM" &&
  //   userMention?.discriminator === "2763"
  // ) {
  //   const channelCache = client.channels.cache.get(genInfo(message).channelId);
  //   const msgCache = channelCache.messages.cache;
  //   let str = ``;
  //   for (const [key, value] of msgCache) {
  //     let val = value.content;
  //     if (val.startsWith("<@") && val.endsWith(">")) {
  //       let user = getUserFromMention(val);
  //       if (user.username !== "MOM") {
  //         str += ` @${user.username}#${user.discriminator} `;
  //       }
  //     } else {
  //       str += `${val}`;
  //     }
  //   }
  //   const sentence = markovChain(str);
  //   const pick = sentence.split("\n").join(" %%%% ").split("%%%%");
  //   sMsg(message, `${capFirst(randomWord(pick))}.`);
  // }
});
client.login(myConf.token);
