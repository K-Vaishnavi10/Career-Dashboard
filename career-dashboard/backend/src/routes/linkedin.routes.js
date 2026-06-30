const express = require('express');
const router = express.Router();

const upload = require('../config/upload');

const { extractText } =
  require('../utils/textExtractor');

const analyzeLinkedinWithGroq =
  require('../services/linkedinGroq.service');

router.post(
  '/analyze',
  upload.single('profile'),

  async (req, res, next) => {

    try {

      console.log('Request received');

      if (!req.file) {
        return res.status(400).json({
          error: 'LinkedIn PDF required'
        });
      }

      const text =
        await extractText(req.file.path);

      console.log('Text extracted');

      const result =
        await analyzeLinkedinWithGroq(text);

      console.log('Final Result:', result);

      res.json(result);

    } catch (err) {

      console.log(err);

      next(err);

    }
  }
);

module.exports = router;