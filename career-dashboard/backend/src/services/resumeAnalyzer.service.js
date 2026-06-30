/**
 * Resume Analyzer Service
 * - Parses raw resume text into structured sections
 * - Computes Resume Score (quality/completeness) and ATS Score (parseability/keyword friendliness)
 */

const SECTION_KEYWORDS = {
  contact: ['email', 'phone', 'linkedin', 'github'],
  summary: ['summary', 'objective', 'profile'],
  experience: ['experience', 'work history', 'employment'],
  education: ['education', 'academic', 'degree', 'university', 'college'],
  skills: ['skills', 'technologies', 'tools', 'technical skills'],
  projects: ['projects', 'project experience'],
  certifications: ['certification', 'certificate', 'license'],
};

const ACTION_VERBS = [
  'achieved', 'built', 'created', 'designed', 'developed', 'engineered', 'implemented',
  'improved', 'increased', 'launched', 'led', 'managed', 'optimized', 'reduced', 'solved',
  'spearheaded', 'streamlined', 'automated', 'architected', 'delivered',
];

const ATS_UNFRIENDLY_PATTERNS = [
  { pattern: /table/i, label: 'tables (may break ATS parsing)' },
  { pattern: /text box/i, label: 'text boxes' },
];

function detectSections(text) {
  const lower = text.toLowerCase();
  const found = {};
  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    found[section] = keywords.some((k) => lower.includes(k));
  }
  return found;
}

function countActionVerbs(text) {
  const lower = text.toLowerCase();
  return ACTION_VERBS.filter((v) => lower.includes(v)).length;
}

function countQuantifiedBullets(text) {
  // lines containing a number/percentage are considered "quantified" achievements
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const quantified = lines.filter((l) => /\d+%|\$\d+|\d{2,}/.test(l));
  return { total: lines.length, quantified: quantified.length };
}

function extractEmailPhone(text) {
  const email = (text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [])[0] || null;
  const phone = (text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/) || [])[0] || null;
  return { email, phone };
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Resume Score (0-100): overall quality & completeness of resume content
 * Weightages:
 *   Section completeness   - 30%
 *   Action verbs usage     - 15%
 *   Quantified achievements- 20%
 *   Length appropriateness - 15%
 *   Contact info present   - 10%
 *   Skills density         - 10%
 */
function computeResumeScore(text) {
  const sections = detectSections(text);
  const sectionScore = (Object.values(sections).filter(Boolean).length / Object.keys(sections).length) * 100;

  const verbCount = countActionVerbs(text);
  const verbScore = Math.min(100, (verbCount / 10) * 100);

  const { total, quantified } = countQuantifiedBullets(text);
  const quantScore = total > 0 ? Math.min(100, (quantified / Math.max(total * 0.3, 1)) * 100) : 0;

  const words = wordCount(text);
  // Ideal resume length ~400-800 words
  let lengthScore;
  if (words < 200) lengthScore = (words / 200) * 60;
  else if (words <= 800) lengthScore = 100;
  else lengthScore = Math.max(40, 100 - (words - 800) / 20);

  const { email, phone } = extractEmailPhone(text);
  const contactScore = (email ? 50 : 0) + (phone ? 50 : 0);

  const lower = text.toLowerCase();
  const skillsMentions = (lower.match(/javascript|python|java|react|node|sql|aws|docker|kubernetes|c\+\+|machine learning|html|css/g) || []).length;
  const skillsScore = Math.min(100, (skillsMentions / 6) * 100);

  const weighted =
    sectionScore * 0.3 +
    verbScore * 0.15 +
    quantScore * 0.2 +
    lengthScore * 0.15 +
    contactScore * 0.1 +
    skillsScore * 0.1;

  return {
    score: Math.round(weighted),
    breakdown: {
      sectionScore: Math.round(sectionScore),
      verbScore: Math.round(verbScore),
      quantScore: Math.round(quantScore),
      lengthScore: Math.round(lengthScore),
      contactScore: Math.round(contactScore),
      skillsScore: Math.round(skillsScore),
    },
    details: { sections, verbCount, quantified, totalBullets: total, words, email, phone },
  };
}

/**
 * ATS Score (0-100): how well a resume would survive an Applicant Tracking System parser
 * Weightages:
 *   Standard section headers present - 25%
 *   No problematic formatting        - 20%
 *   Contact info machine-readable    - 15%
 *   Reasonable file length/density   - 15%
 *   Bullet point usage                - 15%
 *   No special characters/graphics    - 10%
 */
function computeATSScore(text) {
  const sections = detectSections(text);
  const headerScore = (Object.values(sections).filter(Boolean).length / Object.keys(sections).length) * 100;

  const issues = ATS_UNFRIENDLY_PATTERNS.filter((p) => p.pattern.test(text)).map((p) => p.label);
  const formatScore = Math.max(0, 100 - issues.length * 25);

  const { email, phone } = extractEmailPhone(text);
  const contactScore = (email ? 50 : 0) + (phone ? 50 : 0);

  const words = wordCount(text);
  const densityScore = words > 100 && words < 1000 ? 100 : 60;

  const bulletLines = (text.match(/^[\s]*[-•*]\s+/gm) || []).length;
  const bulletScore = Math.min(100, (bulletLines / 8) * 100);

  const specialChars = (text.match(/[^\x00-\x7F]/g) || []).length;
  const specialCharScore = Math.max(0, 100 - specialChars * 2);

  const weighted =
    headerScore * 0.25 +
    formatScore * 0.2 +
    contactScore * 0.15 +
    densityScore * 0.15 +
    bulletScore * 0.15 +
    specialCharScore * 0.1;

  return {
    score: Math.round(weighted),
    breakdown: {
      headerScore: Math.round(headerScore),
      formatScore: Math.round(formatScore),
      contactScore: Math.round(contactScore),
      densityScore: Math.round(densityScore),
      bulletScore: Math.round(bulletScore),
      specialCharScore: Math.round(specialCharScore),
    },
    issuesFound: issues,
  };
}

function generateRecommendations(resumeResult, atsResult) {
  const recs = [];
  if (resumeResult.breakdown.sectionScore < 80) recs.push('Add missing standard sections (Summary, Experience, Education, Skills, Projects).');
  if (resumeResult.breakdown.verbScore < 60) recs.push('Use more strong action verbs (e.g., "built", "led", "optimized") at the start of bullet points.');
  if (resumeResult.breakdown.quantScore < 60) recs.push('Quantify achievements with numbers/metrics (e.g., "improved performance by 30%").');
  if (resumeResult.breakdown.lengthScore < 70) recs.push('Adjust resume length to roughly 400-800 words (about 1-2 pages).');
  if (resumeResult.breakdown.contactScore < 100) recs.push('Ensure both email and phone number are clearly listed.');
  if (atsResult.issuesFound.length > 0) recs.push(`Remove ATS-unfriendly elements: ${atsResult.issuesFound.join(', ')}.`);
  if (atsResult.breakdown.bulletScore < 60) recs.push('Use more bullet points instead of paragraphs for experience/projects.');
  return recs;
}

module.exports = {
  computeResumeScore,
  computeATSScore,
  generateRecommendations,
  extractEmailPhone,
  detectSections,
};
