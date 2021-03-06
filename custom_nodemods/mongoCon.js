"use strict";
const mongo = require("mongodb").MongoClient;
const config = require(`../config.json`);
let dbIp, databaseName;
if (config.testing.usedev) {
  dbIp = config.testing.database.ip;
  databaseName = config.testing.database.name;
} else {
  dbIp = config.database.ip;
  databaseName = config.database.name;
}
const url = `mongodb://${config.database.user}:${config.database.password}@${dbIp}:${config.database.port}/?authSource=${databaseName}`;
const mongoInsert = async (search, collection, database = databaseName) => {
  const prom = new Promise((result, errors) => {
    mongo.connect(url, (err, db) => {
      if (err) throw errors(err);
      const dbo = db.db(database);
      dbo.collection(collection).insertOne(search, (err, res) => {
        if (err) throw errors(err);
        db.close();
        result(res);
      });
    });
  });
  return prom;
};

const mongoQuery = async (search, collection, database = databaseName) => {
  const prom = new Promise((result, errors) => {
    mongo.connect(url, (err, db) => {
      if (err) throw errors(err);
      const dbo = db.db(database);
      dbo
        .collection(collection)
        .find(search)
        .toArray((err, res) => {
          if (err) throw errors(err);
          db.close();
          result(res);
        });
    });
  });
  return prom;
};

const mongoUpdate = async (
  search,
  updatedSearch,
  collection,
  database = databaseName
) => {
  const prom = new Promise((result, errors) => {
    mongo.connect(url, (err, db) => {
      if (err) throw errors(err);
      const dbo = db.db(database);
      dbo
        .collection(collection)
        .updateOne(search, updatedSearch, (err, res) => {
          if (err) throw errors(err);
          db.close();
          result(res);
        });
    });
  });
  return prom;
};

const mongoDelete = async (search, collection, database = databaseName) => {
  const prom = new Promise((result, errors) => {
    mongo.connect(url, (err, db) => {
      if (err) throw errors(err);
      const dbo = db.db(database);
      dbo.collection(collection).deleteOne(search, (err, res) => {
        if (err) throw errors(err);
        db.close();
        result(res);
      });
    });
  });
  return prom;
};

exports.mongoInsert = mongoInsert;
exports.mongoQuery = mongoQuery;
exports.mongoUpdate = mongoUpdate;
exports.mongoDelete = mongoDelete;
