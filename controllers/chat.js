const livechat = require("../services/livechat");
const watson = require("../services/watson");
const config = require("../config/config");
const _ = require("lodash");
const e = require("express");
const constants = require("../constants");
const Stats = require("../models/stats");

// * store user information
const currentGames = {};
const allVoiceNames = [];
const dateOptions = {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
};

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function webhook3(req, res) {
  try {
    console.log("helooa..");
    await livechat.sendEvent("123", "angry", true, "correct");
  } catch (error) {
    console.log(error);
  }
}
async function webhook(req, res) {
  try {
    if (!req.body.webhook_id) {
      throw new Error("Webhook not received");
    }

    // console.log("---------------------------------");
    // console.log("req.body.webhook_id", req.body.webhook_id);
    // console.log("req.body.action", req.body.action);
    // console.log("req.body.payload", req.body.payload);
    // console.log("---------------------------------");

    if (req.body.secret_key != config.livechat_webhook_key) {
      throw new Error("Secret key not matching");
    }

    let imageURL = "";
    let kidMessage = "";
    let imageMain = "";
    let imageType = "";

    // * incoming chat (new thread)
    if (req.body.action === "incoming_chat_thread") {
      imageURL = constants.livechatCDNLinks["game_start"];
      await livechat.sendEvent(
        _.get(req, "body.payload.chat.id"),
        "game",
        true,
        "start"
      );
      return res.send("New incoming chat thread started!");
    }

    if (!req.body.payload.chat_id) {
      throw new Error("No Chat Id");
    }

    console.log("chat_id", req.body.payload.chat_id);

    if (_.get(req, "body.payload.event.type") === "message") {
      kidMessage = _.get(req, "body.payload.event.text");
    } else if (
      _.get(req, "body.payload.event.type") === "file" &&
      _.get(req, "body.payload.event.content_type") === "video/mp4"
    ) {
      // * check if audio already used
      // to prevent double sending
      if (!_.get(req, "body.payload.event.name")) {
        console.log("---------- no payload event name ----------");
        return res.send("---------- no payload event name ----------");
      }

      if (
        _.indexOf(allVoiceNames, _.get(req, "body.payload.event.name")) > -1
      ) {
        throw new Error("Already taken care of - voice note");
      } else {
        allVoiceNames.push(_.get(req, "body.payload.event.name"));
      }

      // * Use Watson to transcribe *
      const PromiseArray = [];
      let transcribeRespSpanish;
      let transcribeRespEnglish;
      PromiseArray.push(
        new Promise(async (resolve, reject) => {
          const resp = await watson.transcribe(
            _.get(req, "body.payload.event.url"),
            "en"
          );
          transcribeRespEnglish = resp;
          resolve(resp);
        })
      );
      PromiseArray.push(
        new Promise(async (resolve, reject) => {
          const resp = await watson.transcribe(
            _.get(req, "body.payload.event.url"),
            "es"
          );
          transcribeRespSpanish = resp;
          resolve(resp);
        })
      );
      await Promise.all(PromiseArray);

      let transcribeResp;

      if (
        transcribeRespEnglish.results[transcribeRespEnglish.result_index]
          .alternatives &&
        transcribeRespEnglish.results[transcribeRespEnglish.result_index]
          .alternatives.length > 0 &&
        transcribeRespSpanish.results[transcribeRespSpanish.result_index]
          .alternatives &&
        transcribeRespSpanish.results[transcribeRespSpanish.result_index]
          .alternatives.length > 0 &&
        transcribeRespEnglish.results[transcribeRespEnglish.result_index]
          .alternatives[0].confidence >=
          transcribeRespSpanish.results[transcribeRespSpanish.result_index]
            .alternatives[0].confidence
      ) {
        transcribeResp = transcribeRespEnglish;
        console.log("English languaged used!");
      } else {
        transcribeResp = transcribeRespSpanish;
        console.log("Spanish languaged used!");
      }

      if (transcribeResp && transcribeResp.results.length > 0) {
        console.log(transcribeResp.results[transcribeResp.result_index]);
        kidMessage =
          transcribeResp.results[transcribeResp.result_index].alternatives[0]
            .transcript;
      }
    }

    if (kidMessage === "") {
      throw new Error("Message empty or not transcribed");
    }

    console.log("kidMessage transcribed: ", kidMessage);

    let deactivateChatCheck = false;
    const chatId = _.get(req, "body.payload.chat_id");

    let stats = await Stats.find({
      customerId: _.get(req, "body.payload.event.author_id"),
    });

    console.log("OG stats type", typeof stats, stats.constructor.name);

    if (!stats || stats.length < 1) {
      console.log("hola stats in here");
      stats = new Stats({
        customerId: _.get(req, "body.payload.event.author_id"),
        totalGames: 0,
        gamesByDate: {},
        averageScore: 0,
        emotionCorrectness: {
          anger: {
            correct: 0,
            total: 0,
          },
          tentative: {
            correct: 0,
            total: 0,
          },
          joy: {
            correct: 0,
            total: 0,
          },
          sadness: {
            correct: 0,
            total: 0,
          },
        },
        finalScores: [],
      });
      const today = new Date().toLocaleDateString("en-US", dateOptions);

      stats.gamesByDate[today] = 0;
      await stats.save();
    } else {
      stats = stats[0];
    }

    if (kidMessage.toLowerCase().includes("ready")) {
      console.log("in ready state");

      const randomOrder = shuffle(constants.emotions);
      const game = {
        order: randomOrder.slice(0, 3),
        // order: ["tentative", "joy", "anger"],
        score: 0,
        index: 0,
      };

      currentGames[chatId] = game;
      // send first photo
      imageURL = constants.livechatCDNLinks[randomOrder[0] + "_start"];
      await livechat.sendEvent(chatId, randomOrder[0], true, "start");

      // update stats
      const today = new Date().toLocaleDateString("en-US", dateOptions);
      stats.totalGames += 1;
      if (today in stats.gamesByDate) {
        stats.gamesByDate[today] += 1;
      } else {
        stats.gamesByDate[today] = 1;
      }
      stats.markModified("gamesByDate");
      await stats.save();

      return res.send("ready system - first image send");
    } else {
      if (!(chatId in currentGames)) {
        console.log("chatId not in currentGames");
        // set start game photo
        imageURL = constants.livechatCDNLinks["game_start"];
        const resp = await livechat.sendEvent(chatId, "game", true, "start");
        return res.status(200).send(`Game started: chatId`);
      } else {
        // * Watson calls *

        //* translate if needed
        console.log("translate language", kidMessage);
        const currentLang = await watson.identifyLanguage(kidMessage);
        console.log("currentLang", currentLang);
        if (currentLang.language !== "en") {
          const translatedKidMessage = await watson.translate(
            kidMessage,
            currentLang.language
          );

          console.log("translatedKidMessage", translatedKidMessage);
          kidMessage = translatedKidMessage.translations[0].translation;
        }

        console.log("kidMessage language: ", currentLang.language);

        const tone = await watson.analyzeTone(kidMessage);

        // * Pick out of 4 emotions: tentative, Joy, Anger, Sadness
        // * id: tentative, joy, anger, sadness
        const emotionFromKidMessage = tone.tone_id;
        console.log("emotionFromKidMessage", emotionFromKidMessage);

        // * check if it matches, if so update score
        const currentIndex = currentGames[chatId]["index"];
        console.log("currentGames[chatId]", currentGames[chatId]);
        let currentGameWin = false;

        if (
          currentGames[chatId]["order"][currentIndex] === emotionFromKidMessage
        ) {
          currentGames[chatId]["score"] += 1;
          currentGameWin = true;
          const currentEmotion = currentGames[chatId]["order"][currentIndex];
          stats.emotionCorrectness[currentEmotion].correct += 1;
          console.log("current game won");
        }
        stats.emotionCorrectness[
          currentGames[chatId]["order"][currentIndex]
        ].total += 1;
        console.log("kid score: ", currentGames[chatId]["score"]);

        // * update index
        currentGames[chatId]["index"] += 1;
        console.log("game round: ", currentGames[chatId]["index"]);

        // * if index reaches 3, game over
        if (currentGames[chatId]["index"] >= 3) {
          // select image related to the score
          // deactivate the chat
          // remove the game from currentGames

          const finalScore = currentGames[chatId]["score"];
          console.log("finalScore", finalScore);

          stats.finalScores.push(finalScore);
          stats.averageScore =
            _.sum(stats.finalScores) / stats.finalScores.length;

          if (finalScore === 0) {
            imageURL = constants.livechatCDNLinks["zero"];
            imageMain = "zero";
            imageType = "";
          } else if (finalScore === 1) {
            imageURL = constants.livechatCDNLinks["one"];
            imageMain = "one";
            imageType = "";
          } else if (finalScore === 2) {
            imageURL = constants.livechatCDNLinks["two"];
            imageMain = "two";
            imageType = "";
          } else {
            imageURL = constants.livechatCDNLinks["three"];
            imageMain = "three";
            imageType = "";
          }
          delete currentGames[chatId];
          deactivateChatCheck = true;
        } else {
          const nextEmotion =
            currentGames[chatId]["order"][currentGames[chatId]["index"]];
          if (currentGameWin) {
            imageURL = constants.livechatCDNLinks[nextEmotion + "_correct"];
            imageMain = nextEmotion;
            imageType = "correct";
          } else {
            imageURL = constants.livechatCDNLinks[nextEmotion + "_wrong"];
            imageMain = nextEmotion;
            imageType = "wrong";
          }
        }
      }

      const resp = await livechat.sendEvent(chatId, imageMain, true, imageType);
      await stats.save();
      // if (deactivateChatCheck) {
      //   await livechat.deactivateChat(chatId);
      //   deactivateChatCheck = false;
      // }
      return res.send("Sent!");
    }
  } catch (error) {
    console.log("webhook failed: ", error);
    return res.status(400).send(error);
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
    const resp = await watson.transcribe(req.body.audioLink);
    // translate the transcribed text
    console.log(
      await watson.translate(resp.results[0].alternatives[0].transcript, "es")
    );
    // const resp = await watson.analyzeTone(req.body.text);
    return res.status(200).json(resp);
  } catch (err) {
    if (err.response.data) {
      console.log(err.response.data.error);
      return res.status(400).json(err.response.data.error);
    }
    console.log(err);
    return res.status(400).json(err);
  }
}

// returns audio file
async function watsonTestAudio(req, res) {
  try {
    const fs = require("fs");
    const filePath = await watson.verbalize(req.body.text);
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Content-Length": stat.size,
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
  watsonTestAudio,
};
