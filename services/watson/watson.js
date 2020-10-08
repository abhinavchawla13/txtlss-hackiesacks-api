const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");
const TextToSpeechV1 = require("ibm-watson/text-to-speech/v1");
const ToneAnalyzerV3 = require("ibm-watson/tone-analyzer/v3");
const config = require("../../config/config");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const languageTranslator = new LanguageTranslatorV3({
  serviceUrl: config.language_translator_url,
  version: "2018-05-01",
});
const speechToText = new SpeechToTextV1({
  serviceUrl: config.speech_to_text_url,
});
const textToSpeech = new TextToSpeechV1({
  serviceUrl: config.text_to_speech_url,
});
const toneAnalyzer = new ToneAnalyzerV3({
  version: "2016-05-19",
  serviceUrl: config.tone_analyzer_url,
});

audioToWav = async (audioLink) => {
  if (audioLink && !audioLink.includes("http")) {
    // local file
    audioLink = path.join(__dirname, audioLink);
  }
  if (audioLink && !path.extname(audioLink).includes(".wav")) {
    const outPath = path.join(__dirname, "../../extras/out.wav");
    return new Promise((resolve, reject) => {
      ffmpeg(audioLink)
        .output(outPath)
        .on("end", () => {
          console.log("Finished processing audio file");
          return resolve(outPath);
        })
        .on("err", (err) => {
          console.log("Error processing audio file", err);
          return reject();
        })
        .run();
    });
  } else {
    return audioLink;
  }
};

exports.analyzeTone = async (text) => {
  console.log(text);
  const resp = await toneAnalyzer.tone({
    toneInput: text,
    contentType: "text/plain",
  });
  if (!resp || !resp.result) {
    throw new Error(`Could not analyze tone of ${text}`);
  }
  console.log("analyzeTone# Tone:", resp.result);
  let toneCategories = resp.result.document_tone.tone_categories;

  // * filter based on "Emotion Tones"
  const toneCategories1 = toneCategories.filter(
    (cat) => cat.category_id === "emotion_tone"
  )[0];

  const toneCategories2 = toneCategories.filter(
    (cat) => cat.category_id === "language_tone"
  )[0];

  let allTones = [...toneCategories1.tones, ...toneCategories2.tones];
  // * sort by highest scores
  allTones = allTones.reduce((a, b) => (a.score > b.score ? a : b));
  return allTones;
};

exports.verbalize = async (text) => {
  const params = { text, voice: "en-US_AllisonVoice", accept: "audio/wav" };

  const resp = await textToSpeech.synthesize(params);

  const audio = resp.result;
  const repairedFile = await textToSpeech.repairWavHeaderStream(audio);
  const outPath = path.join(__dirname, "../../extras/audio.wav");
  fs.writeFileSync(outPath, repairedFile);
  console.log("audio.wav written with a corrected wav header");
  return outPath;
};

exports.transcribe = async (audioLink) => {
  const audioPath = await audioToWav(audioLink);
  console.log("audioToWav done", audioPath);
  const params = {
    audio: fs.createReadStream(audioPath),
    contentType: "audio/wav",
  };
  const resp = await speechToText.recognize(params);
  if (!resp || !resp.result || !resp.result.results) {
    throw new Error(`Could not transcribe`);
  }
  console.log("transcribe# Text:", JSON.stringify(resp.result.results));
  return resp.result;
};

exports.translate = async (text, sourceLang = "en", toLang = "en") => {
  const resp = await languageTranslator.translate({
    text: [text],
    source: sourceLang,
    target: toLang,
  });
  if (!resp || !resp.result || !resp.result.translations) {
    throw new Error(
      `Could not translate from ${sourceLang} to ${toLang} string: ${text}`
    );
  }
  console.log("translate# Translation:", resp.result);
  return resp.result;
};

exports.identifyLanguage = async (text, returnTop = false) => {
  const resp = await languageTranslator.identify({ text });
  if (!resp || !resp.result || !resp.result.languages) {
    throw new Error("Could not identify language");
  }
  if (returnTop) {
    return resp.result.languages.reduce((a, b) =>
      a.confidence > b.confidence ? a : b
    );
  }
  console.log(
    "identifyLanguage# language confidences:",
    resp.result.languages[0]
  );
  // * return the first one
  return resp.result.languages[0];
};
