const express = require('express');
const router = express.Router();

const upload = require('../config/upload');

const { extractText } =
require('../utils/textExtractor');

const {
  computeMatchScore
} = require('../services/jdMatch.service');

const analyzeJDMatchWithGroq =
require('../services/jdMatchGroq.service');

router.post(
  '/',
  upload.single('resume'),
  async (req, res, next) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          error: 'Resume file required'
        });

      }

      const resumeText =
        await extractText(
          req.file.path
        );

      const jdText =
        req.body.jdText;

      if (!jdText) {

        return res.status(400).json({
          error: 'Job Description required'
        });

      }

      const result =
        computeMatchScore(
          resumeText,
          jdText
        );

      const aiAnalysis =
        await analyzeJDMatchWithGroq(
          resumeText,
          jdText,
          result
        );

      res.json({

        ...result,

        strengths:
          aiAnalysis.strengths || [],

        weaknesses:
          aiAnalysis.weaknesses || [],

        missingSkills:
          aiAnalysis.missingSkills || [],

        recommendations:
          aiAnalysis.recommendations || [],

        summary:
          aiAnalysis.summary || ''

      });

    } catch (err) {

      next(err);

    }
  }
);

module.exports = router;