let dotenv = require("dotenv");

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.HEROKU_ENV = process.env.HEROKU_ENV || "staging";

const envFound = dotenv.config();
if (!envFound) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

module.exports = {
  /**
   * Your favorite port
   */
  port: parseInt(process.env.PORT, 10),

  /**
   * That long string from mlab
   */
  databaseURL: process.env.MONGODB_URI,

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },
  /**
   * API configs
   */
  api: {
    prefix: "/api",
  },
  node_env: process.env.NODE_ENV,
  heroku_env: process.env.HEROKU_ENV,
  livechat_username: process.env.LIVECHAT_USERNAME,
  livechat_password: process.env.LIVECHAT_PASSWORD,
  livechat_webhook_key: process.env.LIVECHAT_WEBHOOK_KEY,
  livechat_webhook_key_start: process.env.LIVECHAT_WEBHOOK_KEY_START,
  language_translator_url: process.env.LANGUAGE_TRANSLATOR_URL,
  speech_to_text_url: process.env.SPEECH_TO_TEXT_URL,
  text_to_speech_url: process.env.TEXT_TO_SPEECH_URL,
  tone_analyzer_url: process.env.TONE_ANALYZER_URL,
  language_translator_api: process.env.LANGUAGE_TRANSLATOR_API,
  speech_to_text_api: process.env.SPEECH_TO_TEXT_API,
  text_to_speech_api: process.env.TEXT_TO_SPEECH_API,
  tone_analyzer_api: process.env.TONE_ANALYZER_API,
};
