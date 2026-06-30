import React, { useState } from 'react';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

import { computeOverall } from '../api/client';
import ScoreBadge from '../components/ScoreBadge';
import { useScores } from '../ScoreContext.jsx';

const COLORS = [
  '#6366f1',
  '#22c55e',
  '#06b6d4',
  '#f59e0b',
  '#ec4899',
  '#ef4444'
];

export default function OverallPage() {

  const { scores, subResults } = useScores();

  const [overall, setOverall] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompute = async () => {

    setLoading(true);

    try {

      const res = await computeOverall({
        ...scores,
        subResults
      });

      setOverall(res.data);

    } finally {

      setLoading(false);

    }
  };

  const chartData = Object.entries(scores)
    .filter(([, v]) => typeof v === 'number')
    .map(([key, value]) => ({
      subject: key.replace('Score', ''),
      value
    }));

  return (

    <div>

      <h2 style={{ color: 'white' }}>
        Overall Employability Score
      </h2>

      {/* Scores */}

      <div className="card">

        <h2>Collected Scores</h2>

        <p
          style={{
            color: '#94a3b8',
            fontSize: 13
          }}
        >
          Visit each analyzer tab to
          generate its score. This page
          aggregates them into an
          Overall Employability Score.
        </p>

        <div className="score-grid">

          <ScoreBadge
            label="Resume"
            value={scores.resumeScore}
          />

          <ScoreBadge
            label="ATS"
            value={scores.atsScore}
          />

          <ScoreBadge
            label="JD Match"
            value={scores.matchScore}
          />

          <ScoreBadge
            label="GitHub"
            value={scores.githubScore}
          />

          <ScoreBadge
            label="LinkedIn"
            value={scores.linkedinScore}
          />

          <ScoreBadge
            label="Coding"
            value={scores.codingScore}
          />

        </div>

        <button
          style={{ marginTop: 20 }}
          onClick={handleCompute}
          disabled={loading}
        >

          {loading
            ? 'Computing...'
            : 'Compute Overall Score'}

        </button>

      </div>

      {/* Charts */}

      {chartData.length >= 3 && (

        <div className="overall-charts">

          {/* Pie Chart */}

          <div className="card chart-card">

            <h2>
              Score Distribution
            </h2>

            <ResponsiveContainer
              width="100%"
              height="85%"
            >

              <PieChart>

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="subject"
                  outerRadius={100}
                  label
                >

                  {chartData.map(
                    (entry, index) => (

                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index %
                            COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

          {/* Bar Chart */}

          <div className="card chart-card">

            <h2>
              Score Comparison
            </h2>

            <ResponsiveContainer
              width="100%"
              height="85%"
            >

              <BarChart
                data={chartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="subject"
                />

                <YAxis
                  domain={[0, 100]}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      )}

      {/* Overall Results */}

      {overall && (

        <>

          <div className="card">

            <h2>
              Overall Employability
            </h2>

            <div className="score-grid">

              <ScoreBadge
                label={overall.label}
                value={overall.score}
              />

            </div>

          </div>

          <div className="card">

            <h2>
              Personalized Action Plan
            </h2>

            <ul className="rec-list">

              {overall.actionPlan?.map(
                (item, i) => (

                  <li key={i}>

                    <strong>
                      [{item.priority}]
                    </strong>{' '}

                    {item.area.replace(
                      'Score',
                      ''
                    )}

                    : {item.suggestion}

                  </li>

                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>
              Top Strengths 💪
            </h2>

            <ul className="rec-list">

              {overall.topStrengths?.map(
                (item, i) => (

                  <li key={i}>
                    {item}
                  </li>

                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>
              Improvement Areas 📈
            </h2>

            <ul className="rec-list">

              {overall.topImprovementAreas?.map(
                (item, i) => (

                  <li key={i}>
                    {item}
                  </li>

                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>
              AI Recommendations 💡
            </h2>

            <ul className="rec-list">

              {overall.recommendations?.map(
                (item, i) => (

                  <li key={i}>
                    {item}
                  </li>

                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>
              Weekly Plan 📅
            </h2>

            <ul className="rec-list">

              {overall.weeklyPlan?.map(
                (item, i) => (

                  <li key={i}>
                    {item}
                  </li>

                )
              )}

            </ul>

          </div>

          <div className="card">

            <h2>
              Recruiter Summary 👨‍💼
            </h2>

            <p>
              {overall.recruiterSummary}
            </p>

          </div>

        </>

      )}

    </div>

  );
}