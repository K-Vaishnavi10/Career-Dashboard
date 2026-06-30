const express = require('express');
const router = express.Router();

const upload = require('../config/upload');
const { extractText } = require('../utils/textExtractor');

const {
  computeResumeScore,
  computeATSScore,
  generateRecommendations
} = require('../services/resumeAnalyzer.service');

const analyzeResumeWithGroq =
  require('../services/groq.service');

router.post(
  '/analyze',
  upload.single('resume'),
  async (req, res, next) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          error: 'No resume file uploaded'
        });
      }

      const text = await extractText(req.file.path);

      const resumeResult =
        computeResumeScore(text);

      const atsResult =
        computeATSScore(text);

      const ruleRecommendations =
        generateRecommendations(
          resumeResult,
          atsResult
        );

      const aiAnalysis =
        await analyzeResumeWithGroq(text);

      const recommendations = [
        ...ruleRecommendations,
        ...(aiAnalysis.recommendations || [])
      ];

      res.json({
        success: true,

        fileName: req.file.originalname,

        resumeScore: resumeResult.score,

        atsScore: atsResult.score,

        resumeBreakdown:
          resumeResult.breakdown,

        atsBreakdown:
          atsResult.breakdown,

        atsIssues:
          atsResult.issuesFound,

        strengths:
          aiAnalysis.strengths || [],

        improvements:
          aiAnalysis.improvements || [],

        recruiterImpression:
          aiAnalysis.recruiterImpression || '',

        summary:
          aiAnalysis.summary || '',

        recommendations,

        extractedText:
          text.slice(0, 5000)
      });

    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;