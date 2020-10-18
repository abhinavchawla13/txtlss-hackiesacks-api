let expressLoader = require("./express");
let mongooseLoader = require("./mongoose");

let Logger = require("./logger")("index");

module.exports = async (app) => {
  await mongooseLoader();
  Logger.info("✌️ DB loaded and connected!");

  await expressLoader(app);
  Logger.info("✌️ Express loaded");
};
