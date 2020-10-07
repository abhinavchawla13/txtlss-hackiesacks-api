var watson = require("./watson");

module.exports = {
  transcribe: watson.transcribe,
  translate: watson.translate,
  identifyLanguage: watson.identifyLanguage,
  verbalize: watson.verbalize,
  analyzeTone: watson.analyzeTone,
};
