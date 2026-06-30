import React, { createContext, useContext, useState } from 'react';

const ScoreContext = createContext(null);

export function ScoreProvider({ children }) {
  const [scores, setScores] = useState({
    resumeScore: null,
    atsScore: null,
    matchScore: null,
    githubScore: null,
    linkedinScore: null,
    codingScore: null,
  });
  const [subResults, setSubResults] = useState({});

  const updateScore = (key, value, extra) => {
    setScores((prev) => ({ ...prev, [key]: value }));
    if (extra) setSubResults((prev) => ({ ...prev, [key.replace('Score', '')]: extra }));
  };

  return (
    <ScoreContext.Provider value={{ scores, subResults, updateScore }}>
      {children}
    </ScoreContext.Provider>
  );
}

export function useScores() {
  return useContext(ScoreContext);
}
