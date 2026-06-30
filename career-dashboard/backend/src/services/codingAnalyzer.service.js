const axios = require('axios');
const cheerio = require('cheerio');

/* ===========================
   LEETCODE
=========================== */

async function fetchLeetcode(username) {

  if (!username) return null;

  try {

    // Profile + solved problems
    const profileRes = await axios.post(
      'https://leetcode.com/graphql',
      {
        query: `
        query getUserProfile($username: String!) {

          matchedUser(username: $username) {

            profile {
              ranking
            }

            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }

          userContestRanking(username: $username) {
            rating
          }

        }
        `,
        variables: {
          username
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://leetcode.com'
        }
      }
    );

    const user =
      profileRes.data.data.matchedUser;

    if (!user) return null;

    const contest =
      profileRes.data.data.userContestRanking;

    const stats =
      user.submitStats.acSubmissionNum;

    const easy =
      stats.find(
        x => x.difficulty === 'Easy'
      )?.count || 0;

    const medium =
      stats.find(
        x => x.difficulty === 'Medium'
      )?.count || 0;

    const hard =
      stats.find(
        x => x.difficulty === 'Hard'
      )?.count || 0;

    return {

      platform: 'LeetCode',

      handle: username,

      rating:
        contest?.rating
          ? Math.round(contest.rating)
          : 'N/A',

      globalRank:
        user.profile.ranking || 'N/A',

      problemsSolved:
        easy + medium + hard,

      easySolved: easy,

      mediumSolved: medium,

      hardSolved: hard,

      lastSubmission: 'N/A'

    };

  } catch (err) {

    console.log(
      'LeetCode Error:',
      err.message
    );

    return null;
  }
}

/* ===========================
   CODEFORCES
=========================== */

async function fetchCodeforces(handle) {

  if (!handle) return null;

  try {

    const [userRes, statusRes] =
      await Promise.all([

        axios.get(
          `https://codeforces.com/api/user.info?handles=${handle}`
        ),

        axios.get(
          `https://codeforces.com/api/user.status?handle=${handle}`
        )

      ]);

    const user =
      userRes.data.result[0];

    const submissions =
      statusRes.data.result;

    const solvedSet = new Set();

    submissions.forEach(sub => {

      if (sub.verdict === 'OK') {

        solvedSet.add(
          `${sub.problem.contestId}-${sub.problem.index}`
        );

      }

    });

    return {

      platform: 'Codeforces',

      handle,

      rating:
        user.rating || 'N/A',

      maxRating:
        user.maxRating || 'N/A',

      rank:
        user.rank || 'N/A',

      problemsSolved:
        solvedSet.size,

      lastSubmission:
        submissions.length > 0
          ? new Date(
              submissions[0]
                .creationTimeSeconds * 1000
            ).toLocaleDateString()
          : 'N/A'

    };

  } catch (err) {

    console.log(
      'Codeforces Error:',
      err.message
    );

    return null;
  }
}

/* ===========================
   CODECHEF
=========================== */

async function fetchCodeChef(username) {

  if (!username) return null;

  try {

    const response = await axios.get(
      `https://www.codechef.com/users/${username}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36'
        }
      }
    );

    const $ = cheerio.load(response.data);

    // Rating
    const rating =
      $('.rating-number').first().text().trim() || 'N/A';

    // Stars
    const stars =
      $('.rating').first().text().trim() || 'N/A';

    // Global Rank
    let globalRank = 'N/A';

    $('strong').each((i, el) => {
      const text = $(el).text().trim();

      if (text.includes('Global Rank')) {
        globalRank = text.replace('Global Rank', '').trim();
      }
    });

    // Country Rank
    let countryRank = 'N/A';

    $('strong').each((i, el) => {
      const text = $(el).text().trim();

      if (text.includes('Country Rank')) {
        countryRank = text.replace('Country Rank', '').trim();
      }
    });

    // Fully solved problems are not directly available
    // on the public profile page.

    return {

      platform: 'CodeChef',

      handle: username,

      rating,

      stars,

      globalRank,

      countryRank,

      problemsSolved: 'Not Public',

      lastSubmission: 'N/A'

    };

  } catch (err) {

    console.log(
      'CodeChef Scraping Error:',
      err.message
    );

    return null;
  }
}
/* ===========================
   MAIN FUNCTION
=========================== */

async function fetchCodingProfiles(handles) {

  const results = await Promise.all([

    fetchLeetcode(
      handles.leetcode
    ),

    fetchCodeforces(
      handles.codeforces
    ),

    fetchCodeChef(
      handles.codechef
    )

  ]);

  console.log(results);

  return results.filter(Boolean);
}

module.exports = {
  fetchCodingProfiles
};

module.exports = {
  fetchCodingProfiles
};