const express = require('express');
const router = express.Router();
const {
  fetchGithubProfile,
  computeGithubScore
} = require('../services/githubAnalyzer.service');

const analyzeGithubWithGroq =
  require('../services/githubGroq.service');

// GET /api/github/:username
router.get('/:username', async (req, res, next) => {

  try {

    const { username } = req.params;

    const data =
      await fetchGithubProfile(username);

    const result =
      computeGithubScore(data);

    const aiAnalysis =
      await analyzeGithubWithGroq({
        score: result.score,
        stats: result.stats,
        breakdown: result.breakdown
      });

    res.json({
      ...result,

      strengths:
        aiAnalysis.strengths || [],

      improvements:
        aiAnalysis.improvements || [],

      recommendations:
        aiAnalysis.recommendations || [],

      recruiterImpression:
        aiAnalysis.recruiterImpression || ''
    });

  } catch (err) {

    if (err.response?.status === 404)
      return res.status(404).json({
        error: 'GitHub user not found'
      });

    next(err);
  }
});

module.exports = router;
