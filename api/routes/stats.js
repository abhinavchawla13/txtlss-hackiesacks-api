const { Router } = require("express");
const route = Router();
const { getAll, getOne, notify } = require("../../controllers/stats");

module.exports = (app) => {
  app.use("/stats", route);

  route.get("/all", [getAll]);
  route.get("/one", [getOne]);
  route.get("/notify", [notify]);
};
