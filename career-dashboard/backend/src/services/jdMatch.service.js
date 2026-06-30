/**
 * Resume vs Job Description Matcher
 * Uses TF-based keyword extraction + overlap/cosine similarity for matching.
 */
const natural = require('natural');
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

const STOPWORDS = new Set(natural.stopwords);

function cleanTokens(text) {
  return tokenizer
    .tokenize(text.toLowerCase())
    .filter((t) => t.length > 2 && !STOPWORDS.has(t) && /^[a-z0-9+#.]+$/.test(t));
}
const TECH_SKILLS = [
  'java', 'python', 'javascript', 'typescript', 'c', 'c++',
  'spring', 'spring boot', 'react', 'angular', 'node', 'express',
  'mysql', 'mongodb', 'postgresql', 'sql',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes',
  'git', 'github', 'rest', 'rest api', 'microservices',
  'html', 'css', 'bootstrap', 'tailwind',
  'machine learning', 'deep learning', 'tensorflow',
  'pandas', 'numpy', 'scikit-learn',
  'data structures', 'algorithms', 'oop',
  'linux', 'jira', 'jenkins'
];
function extractKeywords(text) {

  const lowerText = text.toLowerCase();

  return TECH_SKILLS.filter(skill =>
    lowerText.includes(skill.toLowerCase())
  );
}

function jaccardSimilarity(setA, setB) {
  const a = new Set(setA);
  const b = new Set(setB);
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Resume-Job Match Score (0-100)
 * Weightages:
 *   Keyword overlap (Jaccard)     - 50%
 *   Must-have skill coverage      - 35%
 *   Resume keyword density bonus  - 15%
 */
function computeMatchScore(resumeText, jdText) {
  const resumeTokens = cleanTokens(resumeText);
  const jdTokens = cleanTokens(jdText);

  const resumeKeywords = extractKeywords(resumeText);
const jdKeywords = extractKeywords(jdText);

  const overlapScore = jaccardSimilarity(resumeKeywords, jdKeywords) * 100;

  const matchedKeywords = jdKeywords.filter((k) => resumeTokens.includes(k));
  const missingKeywords = jdKeywords.filter((k) => !resumeTokens.includes(k));
  const coverageScore = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) * 100 : 0;

  const densityBonus = Math.min(100, (matchedKeywords.length / Math.max(jdKeywords.length * 0.5, 1)) * 100);

  const weighted = overlapScore * 0.5 + coverageScore * 0.35 + densityBonus * 0.15;

  return {
    score: Math.round(weighted),
    matchedKeywords: matchedKeywords.slice(0, 25),
    missingKeywords: missingKeywords.slice(0, 25),
    breakdown: {
      overlapScore: Math.round(overlapScore),
      coverageScore: Math.round(coverageScore),
      densityBonus: Math.round(densityBonus),
    },
  };
}

module.exports = { computeMatchScore, extractKeywords };
