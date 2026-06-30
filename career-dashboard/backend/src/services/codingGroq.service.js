const axios = require('axios');

async function analyzeCodingWithGroq(platforms) {

  try {

    const prompt = `
You are an expert competitive programming mentor.

Analyze the following coding profiles.

${JSON.stringify(platforms)}

Return ONLY JSON.

{
  "codingScore": 0,
  "strongAreas": [],
  "weakAreas": [],
  "suggestedTopics": [],
  "improvementPlan": [],
  "recommendedContests": [],
  "summary": ""
}

Rules:

1. codingScore should be an integer from 0-100.

2. strongAreas should mention strong DSA areas.

3. weakAreas should mention weak areas.

4. suggestedTopics should recommend topics to improve.

Examples:
[
 "Dynamic Programming",
 "Graphs",
 "Segment Trees"
]

5. improvementPlan should provide actionable steps.

Examples:
[
 "Solve 5 Graph problems weekly.",
 "Participate in at least one contest every week."
]

6. recommendedContests should mention suitable contests.

Examples:
[
 "LeetCode Weekly Contest",
 "Codeforces Div 3",
 "CodeChef Starters"
]

7. summary should summarize the overall coding profile.

Return ONLY valid JSON.
`;

    const response =
      await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',

        {
          model:
            'llama-3.3-70b-versatile',

          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],

          temperature: 0.2
        },

        {
          headers: {
            Authorization:
              `Bearer ${process.env.GROQ_API_KEY}`,

            'Content-Type':
              'application/json'
          }
        }
      );

    let content =
      response.data.choices[0]
        .message.content;

    content = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const json =
      content.match(/\{[\s\S]*\}/);

    return JSON.parse(json[0]);

  } catch (err) {

    console.log(err.message);

    return {

      codingScore: 70,

      strongTopics: [],

      weakTopics: [],

      suggestedTopics: [],

      improvementPlan: [],

      recommendedContests: [],

      summary:
        'Unable to analyze coding profile.'

    };
  }
}

module.exports =
  analyzeCodingWithGroq;