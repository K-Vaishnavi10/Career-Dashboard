import React from 'react';

function scoreClass(value) {
  if (value >= 75) return 'good';
  if (value >= 50) return 'warn';
  return 'bad';
}

export default function ScoreBadge({ label, value }) {
  return (
    <div className="score-pill">
      <div className={`value ${scoreClass(value)}`}>{value ?? '-'}</div>
      <div className="label">{label}</div>
    </div>
  );
}
