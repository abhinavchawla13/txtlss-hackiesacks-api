let expressLoader = require("./express");
let Logger = require("./logger")("index");

module.exports = async (app) => {
  await expressLoader(app);
  Logger.info("✌️ Express loaded");
};
