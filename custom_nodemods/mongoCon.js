const mongo = require("mongodb").MongoClient;
const config = require(`../config.json`);
const url = `mongodb://${config.database.user}:${config.database.password}@${config.database.ip}:${config.database.port}/?authSource=${config.database.name}`;
const mongoInsert = async (
  search,
  collection,
  database = config.database.name
) => {
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

const mongoQuery = async (
  search,
  collection,
  database = config.database.name
) => {
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
  database = config.database.name
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

const mongoDelete = async (
  search,
  collection,
  database = config.database.name
) => {
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
