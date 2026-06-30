const express = require('express');
const router = express.Router();

const {
  fetchCodingProfiles
} = require('../services/codingAnalyzer.service');

const analyzeCodingWithGroq =
  require('../services/codingGroq.service');

router.post('/analyze', async (req, res, next) => {

  try {

    const handles = req.body;

    const profileData =
      await fetchCodingProfiles(handles);

    const aiAnalysis =
      await analyzeCodingWithGroq(profileData);

    res.json({
      platforms: profileData,
      ...aiAnalysis
    });

  } catch (err) {

    next(err);

  }

});

module.exports = router;