import React, { useState } from 'react';
import { analyzeLinkedin } from '../api/client';
import ScoreBadge from '../components/ScoreBadge';
import { useScores } from '../ScoreContext.jsx';

export default function LinkedinPage() {

  const [linkedinUrl, setLinkedinUrl] =
    useState('');

  const [profileFile, setProfileFile] =
    useState(null);

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const { updateScore } = useScores();

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError(null);

    try {

      const res =
        await analyzeLinkedin(
          profileFile,
          linkedinUrl
        );

      setResult(res.data);

      updateScore(
        'linkedinScore',
        res.data.score || 0,
        res.data
      );

    } catch (err) {

      setError(
        err.response?.data?.error ||
        'Failed to analyze profile'
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div>

      <h2 style={{ color: 'white' }}>
        LinkedIn Analyzer
      </h2>

      <div className="card">

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="LinkedIn URL (optional)"
            value={linkedinUrl}
            onChange={(e) =>
              setLinkedinUrl(e.target.value)
            }
          />

          <input
            type="file"
            accept=".pdf"
            onChange={(e) =>
              setProfileFile(
                e.target.files[0]
              )
            }
          />

          <button
            type="submit"
            disabled={
              !profileFile ||
              loading
            }
          >
            {loading
              ? 'Analyzing...'
              : 'Analyze LinkedIn'}
          </button>

        </form>

        {error &&
          <p className="bad">
            {error}
          </p>
        }

      </div>

      {result && (

        <>

          <div className="card">

            <h2>Score</h2>

            <div className="score-grid">

              <ScoreBadge
                label="LinkedIn Score"
                value={result.score || 0}
              />

            </div>

          </div>

          <div className="card">

            <h2>Strengths 👍</h2>

            <ul className="rec-list">

              {result.strengths?.map(
                (item, i) => (
                  <li key={i}>{item}</li>
                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>Missing Sections 📉</h2>

            <ul className="rec-list">

              {result.missingSections?.map(
                (item, i) => (
                  <li key={i}>{item}</li>
                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>Improvements 📈</h2>

            <ul className="rec-list">

              {result.improvements?.map(
                (item, i) => (
                  <li key={i}>{item}</li>
                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>Recommendations 💡</h2>

            <ul className="rec-list">

              {result.recommendations?.map(
                (item, i) => (
                  <li key={i}>{item}</li>
                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>
              Recruiter Impression 👨‍💼
            </h2>

            <p>
              {result.recruiterImpression}
            </p>

          </div>

          <div className="card">

            <h2>Summary</h2>

            <p>
              {result.summary}
            </p>

          </div>

        </>

      )}

    </div>
  );
}