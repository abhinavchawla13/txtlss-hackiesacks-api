let mongoose = require("mongoose");
var Schema = mongoose.Schema;

const StatsSchema = new mongoose.Schema(
  {
    customerId: String,
    totalGames: Number,
    gamesByDate: Schema.Types.Mixed,
    averageScore: Number,
    emotionCorrectness: {
      anger: { correct: Number, total: Number },
      tentative: { correct: Number, total: Number },
      joy: { correct: Number, total: Number },
      sadness: { correct: Number, total: Number },
    },
    finalScores: [Number],
  },
  { strict: false }
);

const Stats = mongoose.model("Stats", StatsSchema);
module.exports = Stats;
