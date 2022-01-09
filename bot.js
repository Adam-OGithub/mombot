const Discord = require("discord.js");
const express = require("express");
const axios = require("axios");
const config = require("./config.json");
const client = new Discord.Client();
const app = express();
const { botStatus } = require("./custom_nodemods/sayings.js");
const { randomWord } = require("./custom_nodemods/utils.js");
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

client.on("message", (message) => {
  if (message.content.indexOf(config.prefix) !== 0) return;
  const args = message.content.slice(config.prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();
  try {
    console.log(`\x1b[32m`, `${message.author.tag} executed '${command}'`);
    let runCommand = require(`./commands/${command}.js`);
    runCommand.run(client, message, args, Discord);
  } catch (e) {
    console.error(`\x1b[32m`, `[ERROR]: ${e.message}`);
  }
});
client.login(config.token);
