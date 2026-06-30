/**
 * GitHub Analyzer
 * Pulls public profile + repo data via GitHub REST API (api.github.com)
 */
const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

function githubClient() {
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return axios.create({ baseURL: GITHUB_API, headers });
}

async function fetchGithubProfile(username) {
  const client = githubClient();
  const [userRes, reposRes] = await Promise.all([
    client.get(`/users/${username}`),
    client.get(`/users/${username}/repos`, { params: { per_page: 100, sort: 'updated' } }),
  ]);

  const user = userRes.data;
  const repos = reposRes.data;

  // Fetch languages for top repos (limit to avoid rate-limit issues)
  const topRepos = repos.slice(0, 10);
  const languageResults = await Promise.allSettled(
    topRepos.map((r) => client.get(`/repos/${username}/${r.name}/languages`))
  );

  const languageTotals = {};
  languageResults.forEach((res) => {
    if (res.status === 'fulfilled') {
      Object.entries(res.value.data).forEach(([lang, bytes]) => {
        languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      });
    }
  });

  return { user, repos, languageTotals };
}

/**
 * GitHub Score (0-100)
 * Weightages:
 *   Repo count & activity      - 20%
 *   Stars received             - 20%
 *   Followers                  - 10%
 *   Language diversity         - 15%
 *   Profile completeness       - 10%
 *   Contribution recency       - 15%
 *   README/documentation usage - 10%
 */
function computeGithubScore({ user, repos, languageTotals }) {
  const repoCount = repos.length;
  const repoScore = Math.min(100, (repoCount / 15) * 100);

  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const starScore = Math.min(100, (totalStars / 50) * 100);

  const followerScore = Math.min(100, ((user.followers || 0) / 50) * 100);

  const langCount = Object.keys(languageTotals).length;
  const langScore = Math.min(100, (langCount / 6) * 100);

  const profileFields = [user.bio, user.blog, user.location, user.avatar_url, user.name];
  const profileScore = (profileFields.filter(Boolean).length / profileFields.length) * 100;

  const now = Date.now();
  const recentRepos = repos.filter((r) => now - new Date(r.pushed_at).getTime() < 1000 * 60 * 60 * 24 * 180);
  const recencyScore = repoCount > 0 ? Math.min(100, (recentRepos.length / Math.min(repoCount, 10)) * 100) : 0;

  const reposWithDescription = repos.filter((r) => r.description && r.description.length > 10).length;
  const docScore = repoCount > 0 ? Math.min(100, (reposWithDescription / repoCount) * 100) : 0;

  const weighted =
    repoScore * 0.2 +
    starScore * 0.2 +
    followerScore * 0.1 +
    langScore * 0.15 +
    profileScore * 0.1 +
    recencyScore * 0.15 +
    docScore * 0.1;

  return {
    score: Math.round(weighted),
    breakdown: {
      repoScore: Math.round(repoScore),
      starScore: Math.round(starScore),
      followerScore: Math.round(followerScore),
      langScore: Math.round(langScore),
      profileScore: Math.round(profileScore),
      recencyScore: Math.round(recencyScore),
      docScore: Math.round(docScore),
    },
    stats: {
      publicRepos: user.public_repos,
      followers: user.followers,
      totalStars,
      languages: languageTotals,
      topRepos: repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
        .map((r) => ({ name: r.name, stars: r.stargazers_count, url: r.html_url, language: r.language })),
    },
  };
}

module.exports = { fetchGithubProfile, computeGithubScore };
