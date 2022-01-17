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
  parseUsrChan,
  getUser,
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

const myConf = {};
if (config.testing.usedev) {
  myConf.token = config.tokens.dev;
} else {
  myConf.token = config.tokens.prod;
}

client.on("message", (message) => {
  //Gets channels and users in message
  const [channels, users, usersF] = parseUsrChan(message.content);
  let isMom = false;
  //looks for mom to see if mentioned
  users.forEach((userid) => {
    let userObj = getUser(userid, client);
    if (userObj.username === "MOM" && userObj.bot) {
      isMom = true;
    }
  });

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
  } else if (isMom) {
    const channelCache = client.channels.cache.get(genInfo(message).channelId);
    const msgCache = channelCache.messages.cache;
    let str = ``;
    for (const [key, value] of msgCache) {
      let val = value.content;
      let valSplit = val.split(" ");
      valSplit.forEach((word, i) => {
        if (word.startsWith("<@") && word.endsWith(">")) {
          valSplit[i] = `\n`;
        }
        str += ` ${valSplit.join(" ")}`;
      });
    }
    //
    const sentence = markovChain(str);
    const pick = sentence.split("\n");
    sMsg(message.channel, `${capFirst(randomWord(pick))}.`);
  }
});
client.login(myConf.token);
