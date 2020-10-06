let { Router } = require("express");
let chat = require("./routes/chat");

// guaranteed to get dependencies
module.exports = () => {
  const app = Router();
  chat(app);

  return app;
};
