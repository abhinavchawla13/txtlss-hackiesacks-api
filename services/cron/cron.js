const Cron = require("cron");
const axios = require("axios");
const config = require("../../config/config");
const livechat = require("../livechat");
const constants = require("../../constants");
const _ = require("lodash");

executeCronAwakeServer = async () => {
  try {
    const resp = await axios({
      method: "get",
      url: "https://txtlss-hackiesacks.herokuapp.com/",
    });
    console.log("CronService Executed", new Date().toISOString());
    return true;
  } catch (err) {
    console.log("Cron init failed", err);
  }
};

executeCronUpdateLinks = async () => {
  try {
    const chatId = "QHEWIBPNDM";

    console.log("executeCronUpdateLinks");
    try {
      await livechat.activateChat(chatId);
    } catch (err) {
      if (
        _.get(err, "response.data.error.message") &&
        _.get(err, "response.data.error.message") === "Chat is already active"
      ) {
        console.log("Chat is already active");
      } else {
        throw new Error("Errored while activating chat");
      }
    }
    let PromiseArray = [];
    Object.keys(constants.livechatCDNLinks).forEach((key) => {
      console.log("executeCronUpdateLinks - ", key);
      PromiseArray.push(
        new Promise(async (resolve, reject) => {
          const resp = await livechat.sendEvent(
            chatId,
            constants.livechatCDNLinks[key]
          );
          transcribeRespEnglish = resp;
          resolve(resp);
        })
      );
    });
    return true;
  } catch (err) {
    console.log("Cron init failed", err);
  }
};

exports.init = async () => {
  try {
    console.log("Initializing CronService");
    const job = new Cron.CronJob(
      "*/25 * * * *",
      () => executeCronAwakeServer(),
      undefined,
      true,
      "America/New_York"
    );
    job.start();

    const job2 = new Cron.CronJob(
      "0 0 */12 * * *",
      () => executeCronUpdateLinks(),
      undefined,
      true,
      "America/New_York"
    );
    job2.start();
    return true;
  } catch (err) {
    console.log("Cron init failed", err);
  }
};
