const livechat = require("../services/livechat");
const watson = require("../services/watson");
const config = require("../config/config");
const _ = require("lodash");
const e = require("express");

async function webhook(req, res) {
  try {
    if (!req.body.webhook_id) {
      throw new Error("Webhook not received");
    }
    if (req.body.secret_key != config.livechat_webhook_key) {
      throw new Error("Secret key not matching");
    }

    // TODO: Do Watson calls
    let kidMessage = "";
    if (_.get(req, "body.payload.event.type") === "message") {
      kidMessage = _.get(req, "body.payload.event.text");
    } else if (
      _.get(req, "body.payload.event.type") === "file" &&
      _.get(req, "body.payload.event.content_type:") === "video/mp4"
    ) {
      // TODO: Use Watson to transcribe (use English and Spanish)
      kidMessage = "what-watson-returns";
    }

    if (kidMessage === "") {
      throw new Error("Message empty or not transcribed");
    }

    // TODO: Run tone analyser on the kidMessage text
    // Hopefully "Joy" and "Happy" come back as same tone
    // Ex: https://tone-analyzer-demo.ng.bluemix.net/

    // TODO: Generate (pick from livechatCDNLinks constants) image
    const imageURL = "";

    // TODO: Use livechat service to send rich message
    // const resp = await livechat.sendEvent(
    //   _.get(req, "body.payload.chat_id"),
    //   imageURL
    // );
    return res.send("All good");
  } catch (error) {
    console.log("webhook failed: ", error);
  }
}

async function sendEvent(req, res) {
  try {
    const resp = await livechat.sendEvent(
      "QHDRN81QPS",
      "https://cdn.livechat-files.com/api/file/lc/tmp/attachments/12262749/a3a4311acac8c28e321e80df46721755/Screen%20Shot%202020-09-29%20at%2012.21.49%20PM.png"
    );
    return res.send(resp);
  } catch (err) {
    console.log(err);
  }
}

async function watsonTest(req, res) {
  try {
    // const resp = await watson.identifyLanguage(req.body.text, req.query.top && req.query.top.toLowerCase() === 'true' ? true : false);
    // const resp = await watson.translate(req.body.text, req.body.fromLand, req.body.toLang);
    // const resp = await watson.transcribe(req.body.audioLink);
    const resp = await watson.analyzeTone(req.body.text);
    return res.status(200).json(resp);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}

// returns audio file
async function watsonTestAudio(req, res) {
  try {
    const fs = require('fs');
    const filePath = await watson.verbalize(req.body.text);
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
}

module.exports = {
  webhook,
  sendEvent,
  watsonTest,
  watsonTestAudio
};
