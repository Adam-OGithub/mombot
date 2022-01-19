"use strict";
const Discord = require("discord.js");
const axios = require("axios");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config.json");
const client = new Discord.Client();
const app = express();
const { botStatus } = require("./custom_nodemods/sayings.js");
const {
  randomWord,
  sMsg,
  genInfo,
  getChannel,
  getPre,
  parseUsrChan,
  getUser,
} = require("./custom_nodemods/utils.js");
const minutes = 5;
const seconds = minutes * 60;
const time = seconds * 1000;

//WEB config=======================
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
//WEB config=======================
// helper funcs =======================
const errmsg = (e) => {
  console.error(`\x1b[32m`, `[ERROR]: ${e.message}`);
};

const cmsg = (str) => {
  console.log(str);
};

const changeAc = async () => {
  //sets activity for bot first
  client.user.setActivity(randomWord(botStatus));
  //sets bot activity every x minutes
  setInterval(() => {
    client.user.setActivity(randomWord(botStatus));
  }, time);
};
// helper funcs =======================
//DATABASE INFO =======================
const dbConf = {
  host: config.sql.host,
  user: config.sql.username,
  password: config.sql.password,
  database: config.sql.database,
  timeout: config.sql.timeout,
};
let con = mysql.createConnection(dbConf);

//END DATABASE INFO =======================
//WEB CONNECT =======================
app.post(config.web.url, async (req, res) => {
  try {
    const resOut = {};
    const reqB = req.body;
    con.query(reqB.query, function (err, result) {
      console.log("hit");
      if (err?.code) {
        resOut.error = err;
        console.log(err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          const handleDis = () => (con = mysql.createConnection(dbConf));
          handleDis();
        }
        console.log(`res err`);
      } else {
        console.log(`resout`);
        resOut.result = result;
      }
      res.json(resOut);
    });
  } catch (e) {
    errmsg(e);
  }
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
//END WEB CONNECT =======================

const alt = (select, client, message, Discord, infoObj) => {
  try {
    let runCommand = require(`./momcommands/${select}.js`);
    if (message.author.bot !== true) {
      cmsg(`${infoObj.tag} ran '${select}.js'`);
      runCommand.run(client, message, Discord, infoObj);
    }
  } catch (e) {
    errmsg(e);
  }
};

const myConf = {};
if (config.testing.usedev) {
  myConf.token = config.tokens.dev;
} else {
  myConf.token = config.tokens.prod;
}

client.on("message", (message) => {
  //Gets channels and users in message
  const [channels, users, usersF] = parseUsrChan(message.content);
  const infoObj = genInfo(message, client);
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
      cmsg(`${infoObj.tag} ran '${command}'`);
      let runCommand = require(`./commands/${command}.js`);
      runCommand.run(client, message, args, Discord, infoObj);
    } catch (e) {
      errmsg(e);
    }
  } else if (message.mentions.everyone) {
    alt("mentionall", client, message, Discord, infoObj);
  } else if (isMom) {
    alt("atmom", client, message, Discord, infoObj);
  } else {
    alt("hello", client, message, Discord, infoObj);
  }
});
client.login(myConf.token);
