/**
 * Overall Employability Score (0-100)
 * Weightages across all sub-scores:
 *   Resume Score            - 15%
 *   ATS Score                - 15%
 *   Resume-Job Match Score   - 20%
 *   GitHub Score             - 20%
 *   LinkedIn Score           - 15%
 *   Coding Profile Score     - 15%
 *
 * Note: If a score is not available (e.g., user skipped GitHub), weights are
 * redistributed proportionally among the remaining available scores.
 */
const WEIGHTS = {
  resumeScore: 0.15,
  atsScore: 0.15,
  matchScore: 0.2,
  githubScore: 0.2,
  linkedinScore: 0.15,
  codingScore: 0.15,
};

function computeOverallScore(scores) {
  const available = Object.entries(scores).filter(([, v]) => typeof v === 'number' && !Number.isNaN(v));
  if (available.length === 0) return { score: 0, breakdown: {} };

  const totalWeight = available.reduce((sum, [key]) => sum + (WEIGHTS[key] || 0), 0);

  let weighted = 0;
  const breakdown = {};
  available.forEach(([key, value]) => {
    const normalizedWeight = (WEIGHTS[key] || 0) / totalWeight;
    weighted += value * normalizedWeight;
    breakdown[key] = { value, weightUsed: Math.round(normalizedWeight * 100) };
  });

  let label = 'Needs Improvement';
  if (weighted >= 85) label = 'Excellent';
  else if (weighted >= 70) label = 'Good';
  else if (weighted >= 50) label = 'Average';

  return { score: Math.round(weighted), label, breakdown };
}

function generateActionPlan(scores, subResults) {
  const plan = [];
  const priorities = Object.entries(scores)
    .filter(([, v]) => typeof v === 'number')
    .sort((a, b) => a[1] - b[1]); // weakest first

  priorities.slice(0, 3).forEach(([key, value]) => {
    plan.push({
      area: key,
      currentScore: value,
      priority: value < 50 ? 'High' : value < 75 ? 'Medium' : 'Low',
      suggestion: actionFor(key, subResults),
    });
  });
  return plan;
}

function actionFor(key, subResults) {
  switch (key) {
    case 'resumeScore':
      return 'Strengthen resume structure: add missing sections, use action verbs, and quantify achievements.';
    case 'atsScore':
      return 'Simplify formatting (avoid tables/text boxes), use standard section headers, and add bullet points.';
    case 'matchScore':
      return `Add missing JD keywords to your resume: ${(subResults?.jdMatch?.missingKeywords || []).slice(0, 8).join(', ') || 'review the job description for key terms'}.`;
    case 'githubScore':
      return 'Push more projects, write descriptive READMEs, and contribute regularly to build commit history.';
    case 'linkedinScore':
      return 'Complete your LinkedIn profile: add a strong headline, detailed About section, and request recommendations.';
    case 'codingScore':
      return 'Practice more problems consistently across LeetCode/Codeforces, focusing on medium/hard difficulty.';
    default:
      return 'Review this area for improvement.';
  }
}

module.exports = { computeOverallScore, generateActionPlan };
