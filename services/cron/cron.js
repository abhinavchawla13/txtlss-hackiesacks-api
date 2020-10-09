const Cron = require('cron');
const axios = require("axios");
const config = require("../../config/config");

executeCron = async () => {
    try {
      const resp = await axios({
        method: "get",
        url: "https://txtlss-hackiesacks.herokuapp.com/",
      });
      console.log('CronService Executed', new Date().toISOString());
      return true;
    } catch (err) {
      console.log("Cron init failed", err);
    }
  };

exports.init = async () => {
  try {
    console.log('Initializing CronService');
    const job = new Cron.CronJob('*/25 * * * *', () => executeCron(), undefined, true, 'America/New_York');
    job.start();
    return true;
  } catch (err) {
    console.log("Cron init failed", err);
  }
};
