let { Router } = require("express");
let chat = require("./routes/chat");
let stats = require("./routes/stats");

// guaranteed to get dependencies
module.exports = () => {
  const app = Router();
  chat(app);
  stats(app);

  return app;
};
