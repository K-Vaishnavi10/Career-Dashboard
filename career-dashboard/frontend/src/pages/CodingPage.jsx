import React, { useState } from 'react';
import { analyzeCoding } from '../api/client';
import ScoreBadge from '../components/ScoreBadge';
import { useScores } from '../ScoreContext.jsx';

export default function CodingPage() {

  const [handles, setHandles] = useState({
    leetcode: '',
    codechef: '',
    codeforces: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { updateScore } = useScores();

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError(null);

    try {

      const res = await analyzeCoding(handles);

      setResult(res.data);

      updateScore(
        'codingScore',
        res.data.codingScore || 0,
        res.data
      );

    } catch (err) {

      setError(
        err.response?.data?.error ||
        'Unable to analyze coding profiles'
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div>
      <h2>Coding Platforms Analyzer</h2>
      <div className="card">

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="LeetCode Handle"
            value={handles.leetcode}
            onChange={(e) =>
              setHandles({
                ...handles,
                leetcode: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="CodeChef Handle"
            value={handles.codechef}
            onChange={(e) =>
              setHandles({
                ...handles,
                codechef: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Codeforces Handle"
            value={handles.codeforces}
            onChange={(e) =>
              setHandles({
                ...handles,
                codeforces: e.target.value
              })
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Analyzing...'
              : 'Analyze Coding Profile'}
          </button>

        </form>

        {error && (
          <p className="bad">
            {error}
          </p>
        )}

      </div>

      {/* Platform Cards */}

      {result?.platforms?.length > 0 && (

        <div className="platform-grid">

          {result.platforms.map((platform) => (

            <div
              className="platform-card"
              key={platform.platform}
            >

              <h3>{platform.platform}</h3>

              <p>
                <strong>Handle:</strong>{' '}
                {platform.handle}
              </p>

              <p>
                <strong>Rating:</strong>{' '}
                {platform.rating || 'N/A'}
              </p>

              <p>
                <strong>Problems Solved:</strong>{' '}
                {platform.problemsSolved || 'N/A'}
              </p>

              {platform.easySolved !== undefined && (
                <p>
                  <strong>Easy:</strong>{' '}
                  {platform.easySolved}
                </p>
              )}

              {platform.mediumSolved !== undefined && (
                <p>
                  <strong>Medium:</strong>{' '}
                  {platform.mediumSolved}
                </p>
              )}

              {platform.hardSolved !== undefined && (
                <p>
                  <strong>Hard:</strong>{' '}
                  {platform.hardSolved}
                </p>
              )}

              {platform.stars && (
                <p>
                  <strong>Stars:</strong>{' '}
                  {platform.stars}
                </p>
              )}

              {platform.rank && (
                <p>
                  <strong>Rank:</strong>{' '}
                  {platform.rank}
                </p>
              )}

            </div>

          ))}

        </div>

      )}

      {/* AI Analysis */}

      {result && (

        <>
        <div style={{ height: '20px' }} />

          <div className="card">
            <h2>Coding Profile Score</h2>

            <div className="score-grid">

              <ScoreBadge
                label="Coding Score"
                value={result.codingScore || 0}
              />

            </div>

          </div>

          <div className="card">

            <h2>Suggested Topics to Learn 📚</h2>

            <ul className="rec-list">

              {result.suggestedTopics?.map(
                (item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>Improvement Plan 🚀</h2>

            <ul className="rec-list">

              {result.improvementPlan?.map(
                (item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>Recommended Contests 🏆</h2>

            <ul className="rec-list">

              {result.recommendedContests?.map(
                (item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>Summary</h2>

            <p>{result.summary}</p>

          </div>

        </>

      )}

    </div>

  );
}