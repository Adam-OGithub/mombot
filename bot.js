const Discord = require("discord.js");
const express = require("express");
const axios = require("axios");
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
} = require("./custom_nodemods/utils.js");
const { use } = require("express/lib/application");
const minutes = 5;
const seconds = minutes * 60;
const time = seconds * 1000;

const keepAlive = async () => {
  const myReq = {};
  myReq.myrequest = "Am I alive?";
  setInterval(() => {
    axios.post("http://127.0.0.1:8000/", myReq).then((response) => {
      console.log(response.data);
    });
  }, time);
};

const changeAc = async () => {
  //sets activity for bot first
  client.user.setActivity(randomWord(botStatus));
  //sets bot activity every x minutes
  setInterval(() => {
    client.user.setActivity(randomWord(botStatus));
  }, time);
};

//Starts web server
//Sets route to use for keepalive
app.all("/", (req, res) => {
  res.send("I am alive!");
});

//sets server app to listen
app.listen(8000, () => {
  console.log("Server is Ready!");
  keepAlive();
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

client.on("message", (message) => {
  const userMention = getUserFromMention(message.content);
  if (message.content.indexOf(config.prefix) === 0) {
    const args = message.content.slice(config.prefix.length).trim().split(" ");
    const command = args.shift().toLowerCase();
    try {
      console.log(`\x1b[32m`, `${message.author.tag} executed '${command}'`);
      let runCommand = require(`./commands/${command}.js`);
      runCommand.run(client, message, args, Discord, genInfo(message, client));
    } catch (e) {
      console.error(`\x1b[32m`, `[ERROR]: ${e.message}`);
    }
  } else if (
    userMention?.bot &&
    userMention?.username === "MOM" &&
    userMention?.discriminator === "2763"
  ) {
    const channelCache = client.channels.cache.get(genInfo(message).channelId);
    const msgCache = channelCache.messages.cache;
    let str = ``;
    for (const [key, value] of msgCache) {
      let val = value.content;
      if (val.startsWith("<@") && val.endsWith(">")) {
        let user = getUserFromMention(val);
        if (user.username !== "MOM") {
          str += ` @${user.username}#${user.discriminator} `;
        }
      } else {
        str += `${val}`;
      }
    }
    const sentence = markovChain(str);
    const pick = sentence.split("\n").join(" %%%% ").split("%%%%");
    sMsg(message, `${capFirst(randomWord(pick))}.`);
  }
});
client.login(config.token);
