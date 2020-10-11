const Cron = require("cron");
const axios = require("axios");
const config = require("../../config/config");
const livechat = require("../livechat");
const constants = require("../../constants");

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
    console.log("executeCronUpdateLinks");
    let PromiseArray = [];
    Object.keys(constants.livechatCDNLinks).forEach((key) => {
      PromiseArray.push(
        new Promise(async (resolve, reject) => {
          const resp = await livechat.sendEvent(
            "QHEWIBPNDM",
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

    // const job2 = new Cron.CronJob(
    //   "*/360 * * * *",
    //   () => executeCronUpdateLinks(),
    //   undefined,
    //   true,
    //   "America/New_York"
    // );
    // job2.start();
    return true;
  } catch (err) {
    console.log("Cron init failed", err);
  }
};
