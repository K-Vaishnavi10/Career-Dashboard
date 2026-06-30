import React, { useState } from 'react';
import { analyzeGithub } from '../api/client';
import ScoreBadge from '../components/ScoreBadge';
import { useScores } from '../ScoreContext.jsx';

export default function GithubPage() {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { updateScore } = useScores();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const res = await analyzeGithub(username.trim());

      setResult(res.data);

      updateScore(
        'githubScore',
        res.data.score,
        res.data
      );

    } catch (err) {

      setError(
        err.response?.data?.error ||
        'Failed to analyze GitHub profile'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <h2 style={{ color: 'white' }}>
        GitHub Analyzer
      </h2>

      <div className="card">

        <h2>GitHub Username</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            placeholder="e.g. torvalds"
          />

          <button
            type="submit"
            disabled={!username || loading}
          >
            {loading
              ? 'Fetching...'
              : 'Analyze GitHub'}
          </button>

        </form>

        {error && (
          <p className="bad">{error}</p>
        )}

      </div>

      {result && (
        <>

          {/* Score Card */}

          <div className="card">

            <h2>GitHub Score</h2>

            <div className="score-grid">

              <ScoreBadge
                label="GitHub Score"
                value={result.score}
              />

              <ScoreBadge
                label="Public Repos"
                value={result.stats.publicRepos}
              />

              <ScoreBadge
                label="Followers"
                value={result.stats.followers}
              />

              <ScoreBadge
                label="Total Stars"
                value={result.stats.totalStars}
              />

            </div>

          </div>


          {/* Top Repositories */}

          <div className="card">

            <h2>Top Repositories</h2>

            <ul className="rec-list">

              {result.stats.topRepos.map((repo) => (

                <li key={repo.name}>

                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#22d3ee' }}
                  >
                    {repo.name}
                  </a>

                  {' '}— ⭐ {repo.stars}
                  {' '}({repo.language || 'N/A'})

                </li>

              ))}

            </ul>

          </div>


          {/* Languages */}

          <div className="card">

            <h2>Languages Used</h2>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >

              {Object.keys(
                result.stats.languages
              ).map((lang) => (

                <span
                  key={lang}
                  className="tag"
                >
                  {lang}
                </span>

              ))}

            </div>

          </div>


          {/* Strengths */}

          <div className="card">

            <h2>What's Good 👍</h2>

            {result.strengths?.length > 0 ? (

              <ul className="rec-list">

                {result.strengths.map(
                  (item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  )
                )}

              </ul>

            ) : (

              <p>
                No strengths available.
              </p>

            )}

          </div>


          {/* Improvements */}

          <div className="card">

            <h2>
              Improvements Needed 📈
            </h2>

            {result.improvements?.length > 0 ? (

              <ul className="rec-list">

                {result.improvements.map(
                  (item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  )
                )}

              </ul>

            ) : (

              <p>
                No improvements suggested.
              </p>

            )}

          </div>


          {/* Recommendations */}

          <div className="card">

            <h2>Recommendations 💡</h2>

            {result.recommendations?.length > 0 ? (

              <ul className="rec-list">

                {result.recommendations.map(
                  (item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  )
                )}

              </ul>

            ) : (

              <p>
                No recommendations available.
              </p>

            )}

          </div>


          {/* Recruiter Impression */}

          <div className="card">

            <h2>
              Recruiter Impression 👨‍💼
            </h2>

            <p>
              {result.recruiterImpression ||
                'No recruiter impression generated.'}
            </p>

          </div>

        </>
      )}

    </div>
  );
}
