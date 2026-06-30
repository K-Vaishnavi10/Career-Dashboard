import React, { useState } from 'react';
import { analyzeResume } from '../api/client';
import ScoreBadge from '../components/ScoreBadge';
import { useScores } from '../ScoreContext.jsx';

export default function ResumePage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { updateScore } = useScores();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeResume(file);
      setResult(res.data);
      updateScore('resumeScore', res.data.resumeScore, res.data);
      updateScore('atsScore', res.data.atsScore);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: 'white' }}>Resume & ATS Analyzer</h2>

      <div className="card">
        <h2>Upload Resume (PDF / DOCX)</h2>
        <form onSubmit={handleSubmit}>
          <input type="file" accept=".pdf,.docx,.doc" onChange={(e) => setFile(e.target.files[0])} />
          <button type="submit" disabled={!file || loading}>
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </form>
        {error && <p className="bad">{error}</p>}
      </div>

      {result && (
  <>
    <div className="card">
      <h2>Scores</h2>

      <div className="score-grid">
        <ScoreBadge
          label="Resume Score"
          value={result.resumeScore}
        />

        <ScoreBadge
          label="ATS Score"
          value={result.atsScore}
        />
      </div>
    </div>

    <div className="card">
      <h2>What is Good 👍</h2>

      {result.strengths?.length > 0 ? (
        <ul className="rec-list">
          {result.strengths.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No strengths available.</p>
      )}
    </div>

    <div className="card">
      <h2>Improvements Needed 📈</h2>

      {result.improvements?.length > 0 ? (
        <ul className="rec-list">
          {result.improvements.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No improvements suggested.</p>
      )}
    </div>

    <div className="card">
      <h2>Recommendations 💡</h2>

      <ul className="rec-list">
        {result.recommendations?.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>

    <div className="card">
      <h2>Recruiter Impression 👨‍💼</h2>

      <p>
        {result.recruiterImpression}
      </p>
    </div>

    <div className="card">
      <h2>Summary 📝</h2>

      <p>{result.summary}</p>
    </div>
  </>
)}
    </div>
  );
}
