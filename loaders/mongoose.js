let mongoose = require("mongoose");
let config = require("../config/config");

module.exports = async () => {
  const connection = await mongoose.connect(config.databaseURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  });
  return connection.connection.db;
};
