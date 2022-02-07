"use strict";
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const config = require("../config.json");
const { cmsg, errmsg, tryFail } = require("../custom_nodemods/utils.js");
const app = express();

const webdb = async () => {
  //Set database config
  const dbConf = {
    host: config.sql.host,
    user: config.sql.username,
    password: config.sql.password,
    database: config.sql.database,
    timeout: config.sql.timeout,
  };
  let con = mysql.createConnection(dbConf);

  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(bodyParser.json());

  app.post(config.web.url, async (req, res) => {
    try {
      const resOut = {};
      const reqB = req.body;
      con.query(reqB.query, function (err, result) {
        if (err?.code) {
          resOut.error = "Mom is broken...";
          cmsg(`Error1=${err}`);
          //If connection is lost reset connection
          if (err.code === "PROTOCOL_CONNECTION_LOST") {
            const handleDis = () => (con = mysql.createConnection(dbConf));
            handleDis();
            cmsg("WARNING!! Connection lost and reset.");
          }
        } else {
          resOut.result = result;
        }
        res.json(resOut);
      });
    } catch (e) {
      errmsg(e);
      resOut.error = "Mom is broken..";
      if (e?.code) {
        cmsg(`Error2=${e}`);
        //If connection is lost reset connection
        if (e.code === "PROTOCOL_CONNECTION_LOST") {
          const handleDis = () => (con = mysql.createConnection(dbConf));
          handleDis();
          cmsg("WARNING!! Connection lost and reset.");
        }
      }
      res.json(resOut);
    }
  });

  //sets server app to listen
  app.listen(config.web.port, () => {
    cmsg("Server Ready!");
  });
};
exports.webdb = webdb;
