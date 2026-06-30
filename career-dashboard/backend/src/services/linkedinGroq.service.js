const axios = require('axios');

async function analyzeLinkedinWithGroq(text) {

  try {

    const prompt = `
You are an expert recruiter and LinkedIn career coach.

Analyze the LinkedIn profile below.

Return ONLY valid JSON.

Do not use markdown.
Do not use code blocks.

Return exactly this format:

{
  "score": 0,
  "strengths": [],
  "missingSections": [],
  "improvements": [],
  "recommendations": [],
  "recruiterImpression": "",
  "summary": ""
}

Rules:

1. score must be an integer from 0 to 100.
2. strengths should contain positive aspects.
3. missingSections should contain missing profile sections.
4. improvements should contain profile improvements.
5. recommendations should be actionable.
6. recruiterImpression should be 2-3 sentences.
7. summary should summarize overall profile quality.

LinkedIn Profile:

"""
${text}
"""
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

        temperature: 0.2
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

    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in Groq response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      score: parsed.score || 70,
      strengths: parsed.strengths || [],
      missingSections: parsed.missingSections || [],
      improvements: parsed.improvements || [],
      recommendations: parsed.recommendations || [],
      recruiterImpression:
        parsed.recruiterImpression ||
        'Recruiter impression unavailable.',
      summary:
        parsed.summary ||
        'Summary unavailable.'
    };

  } catch (err) {

    console.log("===== GROQ ERROR =====");

    if (err.response?.data) {
      console.log(err.response.data);
    } else {
      console.log(err.message);
    }

    console.log("======================");

    return {

      score: 70,

      strengths: [
        'Profile successfully uploaded.'
      ],

      missingSections: [],

      improvements: [
        'Unable to generate AI improvements currently.'
      ],

      recommendations: [
        'Please try again later.'
      ],

      recruiterImpression:
        'Unable to generate recruiter impression at this time.',

      summary:
        'AI analysis unavailable.'
    };
  }
}

module.exports = analyzeLinkedinWithGroq;