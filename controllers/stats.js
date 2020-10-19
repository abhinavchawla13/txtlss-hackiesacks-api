const { round, sum } = require("lodash");
const constants = require("../constants");
const Stats = require("../models/stats");

async function getAll(req, res) {
  const stats = await Stats.find({});

  if (!stats || stats.length < 1) {
    console.log("No stats found");
  }

  let totalGames = 0;
  let totalScore = 0;
  let scoreDistribution = {
    zero: 0,
    one: 0,
    two: 0,
    three: 0,
  };
  let emotionTotals = {
    joy: {
      total: 0,
      correct: 0,
    },
    sadness: {
      total: 0,
      correct: 0,
    },
    tentative: {
      total: 0,
      correct: 0,
    },
    anger: {
      total: 0,
      correct: 0,
    },
  };
  let timelines = {};

  stats.forEach((stat) => {
    totalGames += stat.totalGames;
    totalScore += sum(stat.finalScores);

    stat.finalScores.forEach((score) => {
      if (score === 0) scoreDistribution["zero"] += 1;
      else if (score === 1) scoreDistribution["one"] += 1;
      else if (score === 2) scoreDistribution["two"] += 1;
      else if (score === 3) scoreDistribution["three"] += 1;
    });

    constants.emotions.forEach((emo) => {
      emotionTotals[emo].correct += stat.emotionCorrectness[emo].correct || 0;
      emotionTotals[emo].total += stat.emotionCorrectness[emo].total || 0;
    });

    for (date in stat.gamesByDate) {
      if (date in timelines) {
        timelines[date] += stat.gamesByDate[date];
      } else {
        timelines[date] = stat.gamesByDate[date];
      }
    }
  });

  let timelineRefine = [];
  for (key in timelines) {
    const timelineObj = {};
    timelineObj["name"] = key;
    timelineObj["value"] = timelines[key];
    timelineRefine.push(timelineObj);
  }

  let scoreDistributionRefine = [];
  for (let i = 0; i <= 3; i++) {
    if (i === 0) {
      scoreDistributionRefine.push({
        name: "0/3",
        value: scoreDistribution["zero"],
      });
    } else if (i === 1) {
      scoreDistributionRefine.push({
        name: "1/3",
        value: scoreDistribution["one"],
      });
    } else if (i === 2) {
      scoreDistributionRefine.push({
        name: "2/3",
        value: scoreDistribution["two"],
      });
    } else if (i === 3) {
      scoreDistributionRefine.push({
        name: "3/3",
        value: scoreDistribution["three"],
      });
    }
  }

  const response = {
    totalGames: totalGames,
    averageScore: parseFloat((totalScore / totalGames).toFixed(2)),
    scoreDistribution: scoreDistributionRefine,
    emotionCorrectness: {
      joy:
        round(
          (emotionTotals["joy"].correct / emotionTotals["joy"].total) * 100
        ) || 0,
      sadness:
        round(
          (emotionTotals["sadness"].correct / emotionTotals["sadness"].total) *
            100
        ) || 0,
      anger:
        round(
          (emotionTotals["anger"].correct / emotionTotals["anger"].total) * 100
        ) || 0,
      tentative:
        round(
          (emotionTotals["tentative"].correct /
            emotionTotals["tentative"].total) *
            100
        ) || 0,
    },
    timelines: timelineRefine.sort(
      (a, b) => new Date(a.name) - new Date(b.name)
    ),
  };

  return res.status(200).send(response);
}

async function getOne(req, res) {
  try {
    if (!req.query.customerId) {
      throw new Error("CustomerId not provided");
    }

    const stats = await Stats.findOne({ customerId: req.query.customerId });

    if (!stats) {
      console.log("No stats found");
    }

    const response = {
      customerId: stats.customerId,
      totalGames: stats.totalGames,
      averageScore: parseFloat(stats.averageScore.toFixed(2)),
      emotionCorrectness: {
        anger: {
          percentage: round(
            (stats.emotionCorrectness.anger.correct /
              stats.emotionCorrectness.anger.total) *
              100
          ),
        },
        tentative: {
          percentage: round(
            (stats.emotionCorrectness.tentative.correct /
              stats.emotionCorrectness.tentative.total) *
              100
          ),
        },
        joy: {
          percentage: round(
            (stats.emotionCorrectness.joy.correct /
              stats.emotionCorrectness.joy.total) *
              100
          ),
        },
        sadness: {
          percentage: round(
            (stats.emotionCorrectness.sadness.correct /
              stats.emotionCorrectness.sadness.total) *
              100
          ),
        },
      },
      finalScores: stats.finalScores,
    };

    return res.status(200).send(response);
  } catch (error) {
    console.log("err", error);
  }
}

async function notify(req, res) {
  try {
    res.send("User notified");
  } catch (error) {
    console.log("notify error", error);
  }
}

module.exports = {
  getAll,
  getOne,
  notify,
};
