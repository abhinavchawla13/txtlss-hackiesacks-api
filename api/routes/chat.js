let { Router } = require("express");
let { celebrate, Joi } = require("celebrate");
const route = Router();

let { webhook } = require("../../controllers/chat");

module.exports = (app) => {
  app.use("/chat", route);

  route.post("/webhook", [webhook]);
};
