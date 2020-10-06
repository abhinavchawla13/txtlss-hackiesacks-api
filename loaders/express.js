let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");
let routes = require("../api");
let config = require("../config/config");
const morgan = require("morgan");
const { errors } = require("celebrate");

module.exports = (app) => {
  /**
   * Health Check endpoints
   */
  app.get("/status", (req, res) => {
    res.status(200).send({ message: "Connection Successful" });
  });

  app.get("/", (req, res) => {
    res
      .status(200)
      .send(
        `Welcome to hackiesacks txtlss API 😀 [environment: ${config.heroku_env}, build: ${config.node_env}]`
      );
  });

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable("trust proxy");

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // middleware for HTTP intercepts
  app.use(morgan("dev"));

  // Middleware that transforms the raw string of req.body into json
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  app.use(bodyParser.json());

  // Load API routes
  app.use(config.api.prefix, routes());

  /// catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error("Not Found");
    err["status"] = 404;
    next(err);
  });

  /// error handlers
  app.use((err, req, res, next) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === "UnauthorizedError") {
      return res.status(err.status).send({ message: err.message }).end();
    }
    return next(err);
  });

  app.use(errors());
  app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  });
};
