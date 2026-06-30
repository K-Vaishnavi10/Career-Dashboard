const express = require('express');
const router = express.Router();

const {
  computeOverallScore,
  generateActionPlan
} = require('../services/overall.service');

const analyzeOverallWithGroq =
  require('../services/overallGroq.service');

router.post('/', async (req, res, next) => {

  try {

    const { subResults, ...scores } =
      req.body;

    const overall =
      computeOverallScore(scores);

    const actionPlan =
      generateActionPlan(
        scores,
        subResults || {}
      );

    const aiInsights =
      await analyzeOverallWithGroq({

        scores,

        overallScore:
          overall.score,

        actionPlan

      });

    res.json({

      ...overall,

      actionPlan,

      ...aiInsights

    });

  } catch (err) {

    next(err);

  }

});

module.exports = router;