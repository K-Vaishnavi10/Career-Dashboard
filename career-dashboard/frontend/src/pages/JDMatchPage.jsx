import React, { useState } from 'react';
import { matchJD } from '../api/client';
import ScoreBadge from '../components/ScoreBadge';
import { useScores } from '../ScoreContext.jsx';

export default function JDMatchPage() {

  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { updateScore } = useScores();

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError(null);

    try {

      const res =
        await matchJD(
          resumeFile,
          jdText
        );

      setResult(res.data);

      updateScore(
        'matchScore',
        res.data.score,
        res.data
      );

    } catch (err) {

      setError(
        err.response?.data?.error ||
        'Failed to compute match score'
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div>

      <h2 style={{ color: 'white' }}>
        Resume vs Job Description Match
      </h2>

      <div className="card">

        <h2>Upload Resume</h2>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) =>
            setResumeFile(
              e.target.files[0]
            )
          }
        />

        <h2>Paste Job Description</h2>

        <textarea
          value={jdText}
          onChange={(e) =>
            setJdText(e.target.value)
          }
          placeholder="Paste the job description here"
        />

        <button
          onClick={handleSubmit}
          disabled={
            !resumeFile ||
            !jdText ||
            loading
          }
        >

          {loading
            ? 'Matching...'
            : 'Compute Match Score'}

        </button>

        {error &&
          <p className="bad">
            {error}
          </p>
        }

      </div>

      {result && (
        <>
          <div className="card">

            <h2>Match Score</h2>

            <div className="score-grid">

              <ScoreBadge
                label="Resume-JD Match"
                value={result.score}
              />

            </div>

          </div>

          <div className="card">

            <h2>Matched Keywords</h2>

            {result.matchedKeywords?.map(
              (k) => (

                <span
                  key={k}
                  className="tag"
                >
                  {k}
                </span>

              )
            )}

          </div>

          <div className="card">

            <h2>Strengths 👍</h2>

            <ul className="rec-list">

              {result.strengths?.map(
                (s, i) => (
                  <li key={i}>
                    {s}
                  </li>
                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>Missing Skills 📉</h2>

            <ul className="rec-list">

              {result.missingSkills?.map(
                (s, i) => (
                  <li key={i}>
                    {s}
                  </li>
                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>Recommendations 💡</h2>

            <ul className="rec-list">

              {result.recommendations?.map(
                (s, i) => (
                  <li key={i}>
                    {s}
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
