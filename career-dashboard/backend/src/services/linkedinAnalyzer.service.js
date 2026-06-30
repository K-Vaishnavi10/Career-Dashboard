/**
 * LinkedIn Analyzer
 * NOTE: LinkedIn does not provide a public API for arbitrary profile scraping,
 * and scraping LinkedIn violates its Terms of Service. For the hackathon,
 * we use a manual/structured input form where the user pastes profile details
 * (headline, about, experience count, skills, etc.) OR uploads their
 * "LinkedIn data export" (Settings > Get a copy of your data).
 */

/**
 * LinkedIn Score (0-100)
 * Weightages:
 *   Headline & About quality   - 20%
 *   Experience entries         - 20%
 *   Skills listed              - 15%
 *   Education listed           - 10%
 *   Recommendations/endorsements - 15%
 *   Profile completeness (photo, banner, etc.) - 10%
 *   Activity (posts/articles)  - 10%
 */
function computeLinkedinScore(profileData) {
  const {
    headline = '',
    about = '',
    experienceCount = 0,
    skillsCount = 0,
    educationCount = 0,
    recommendationsCount = 0,
    endorsementsCount = 0,
    hasProfilePhoto = false,
    hasBanner = false,
    connectionsCount = 0,
    recentPostsCount = 0,
  } = profileData;

  const headlineScore = Math.min(100, (headline.length / 80) * 60 + (about.length / 300) * 40);
  const experienceScore = Math.min(100, (experienceCount / 3) * 100);
  const skillsScore = Math.min(100, (skillsCount / 15) * 100);
  const educationScore = Math.min(100, (educationCount / 1) * 100);
  const socialProofScore = Math.min(100, (recommendationsCount / 3) * 60 + (endorsementsCount / 20) * 40);
  const completenessScore =
    (hasProfilePhoto ? 40 : 0) + (hasBanner ? 20 : 0) + Math.min(40, (connectionsCount / 300) * 40);
  const activityScore = Math.min(100, (recentPostsCount / 4) * 100);

  const weighted =
    headlineScore * 0.2 +
    experienceScore * 0.2 +
    skillsScore * 0.15 +
    educationScore * 0.1 +
    socialProofScore * 0.15 +
    completenessScore * 0.1 +
    activityScore * 0.1;

  return {
    score: Math.round(weighted),
    breakdown: {
      headlineScore: Math.round(headlineScore),
      experienceScore: Math.round(experienceScore),
      skillsScore: Math.round(skillsScore),
      educationScore: Math.round(educationScore),
      socialProofScore: Math.round(socialProofScore),
      completenessScore: Math.round(completenessScore),
      activityScore: Math.round(activityScore),
    },
    note: 'Score derived from manually submitted profile data (no live LinkedIn scraping due to ToS restrictions).',
  };
}

module.exports = { computeLinkedinScore };
