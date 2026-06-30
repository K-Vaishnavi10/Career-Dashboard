const axios = require('axios');

async function analyzeGithubWithGroq(githubData) {

  try {

    const prompt = `
You are an experienced software engineering recruiter.

Analyze this GitHub profile.

Provide:

1. Strengths
2. Improvements needed
3. Recommendations
4. Recruiter impression

Return ONLY raw JSON.

Format:

{
  "strengths": [],
  "improvements": [],
  "recommendations": [],
  "recruiterImpression": ""
}

GitHub Data:

${JSON.stringify(githubData, null, 2)}
`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let content =
      response.data.choices[0].message.content;

    content = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const jsonMatch =
      content.match(/\{[\s\S]*\}/);

    if (!jsonMatch)
      throw new Error('Invalid JSON');

    return JSON.parse(jsonMatch[0]);

  } catch (err) {

    console.log(err.message);

    return {
      strengths: [],
      improvements: [],
      recommendations: [],
      recruiterImpression:
        'Unable to generate AI insights.'
    };
  }
}

module.exports = analyzeGithubWithGroq;