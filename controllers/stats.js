const { round, sum } = require("lodash");
const constants = require("../constants");
const Stats = require("../models/stats");
const livechat = require("../services/livechat");

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
          percentage:
            round(
              (stats.emotionCorrectness.anger.correct /
                stats.emotionCorrectness.anger.total) *
                100
            ) || 0,
        },
        tentative: {
          percentage:
            round(
              (stats.emotionCorrectness.tentative.correct /
                stats.emotionCorrectness.tentative.total) *
                100
            ) || 0,
        },
        joy: {
          percentage:
            round(
              (stats.emotionCorrectness.joy.correct /
                stats.emotionCorrectness.joy.total) *
                100
            ) || 0,
        },
        sadness: {
          percentage:
            round(
              (stats.emotionCorrectness.sadness.correct /
                stats.emotionCorrectness.sadness.total) *
                100
            ) || 0,
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
    if (!req.query.customer_id) {
      throw new Error("customerId not provided");
    }

    const stats = await Stats.findOne({ customerId: req.query.customer_id });

    if (!stats) {
      console.log("No stats found");
    }

    const userStats = {
      customerId: stats.customerId,
      totalGames: stats.totalGames,
      averageScore: parseFloat(stats.averageScore.toFixed(2)),
      emotionCorrectness: {
        anger:
          {
            percentage: round(
              (stats.emotionCorrectness.anger.correct /
                stats.emotionCorrectness.anger.total) *
                100
            ),
          } || -1,
        tentative: {
          percentage: round(
            (stats.emotionCorrectness.tentative.correct /
              stats.emotionCorrectness.tentative.total) *
              100
          ),
        },
        joy: {
          percentage:
            round(
              (stats.emotionCorrectness.joy.correct /
                stats.emotionCorrectness.joy.total) *
                100
            ) || -1,
        },
        sadness: {
          percentage:
            round(
              (stats.emotionCorrectness.sadness.correct /
                stats.emotionCorrectness.sadness.total) *
                100
            ) || -1,
        },
      },
    };

    const lowest = Object.keys(userStats.emotionCorrectness)
      .filter((key) => userStats.emotionCorrectness[key].percentage != -1)
      .reduce((a, b) =>
        userStats.emotionCorrectness[a].percentage <
        userStats.emotionCorrectness[b].percentage
          ? a
          : b
      );

    const highest = Object.keys(userStats.emotionCorrectness).reduce((a, b) =>
      userStats.emotionCorrectness[a].percentage >
      userStats.emotionCorrectness[b].percentage
        ? a
        : b
    );

    let message = `Thanks for playing The Emotican Game! \n\nYou played the game ${userStats.totalGames} number of times and your average score was ${userStats.averageScore} out of 3. \n\n`;

    if (userStats.averageScore < 3) {
      message += `Based on your performance, we found you had the most trouble guessing the "${lowest}" emotion, while performing best guessing "${highest}" emotion.\n\nWe recommend you the following resource to help you improve: https://blog.stageslearning.com/blog/teaching-children-with-autism-about-emotions`;
    } else {
      message += `Your performance was brilliant. Here is a resource you might find interesting: https://blog.stageslearning.com/blog/teaching-children-with-autism-about-emotions`;
    }

    await livechat.sendEvent(
      req.query.chat_id,
      message,
      (rich_message = false)
    );

    res.status(200).send("User notified");
  } catch (error) {
    console.log("notify error", error);
  }
}

module.exports = {
  getAll,
  getOne,
  notify,
};
