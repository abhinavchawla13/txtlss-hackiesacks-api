let { Router } = require("express");
let { celebrate, Joi } = require("celebrate");
const route = Router();

let { create, webhook } = require("../../controllers/chat");

module.exports = (app) => {
  app.use("/chat", route);

  // TODO: fix celebrate body
  route.post(
    "/",
    // celebrate({
    //   body: Joi.object({
    //     coilId: Joi.string().required(),
    //     provider: Joi.string().required(),
    //     clientId: Joi.string().required(),
    //   }),
    // }),
    [create]
  );

  route.post("/webhook", [webhook]);
};
