let { Router } = require("express");
let { celebrate, Joi } = require("celebrate");
const route = Router();

let { webhook, sendEvent } = require("../../controllers/chat");

module.exports = (app) => {
  app.use("/chat", route);

  route.post("/webhook", [webhook]);

  // Just for testing LiveChat
  route.post("/webhook2", [webhook]);

  // Just for internal testing purposes
  route.post("/send", [sendEvent]);
};
