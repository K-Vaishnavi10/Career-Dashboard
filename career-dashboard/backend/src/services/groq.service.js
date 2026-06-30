const axios = require('axios');

async function analyzeResumeWithGroq(resumeText) {
  try {
    const prompt = `
You are a senior recruiter, ATS specialist, and career coach.

Analyze the resume from a recruiter's perspective.

Provide only:
1. What is good in the resume.
2. What improvements are needed.
3. Top recommendations.
4. Overall recruiter impression.
5. Final summary.

Return ONLY a raw JSON object.

Do NOT use markdown.
Do NOT use triple backticks.
Do NOT add explanations outside JSON.

Return JSON in exactly this format:

{
  "strengths": [],
  "improvements": [],
  "recommendations": [],
  "recruiterImpression": "",
  "summary": ""
}

Resume:
${resumeText}
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

    let content = response.data.choices[0].message.content;

    content = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {

    console.error(
      'Groq Error:',
      error.response?.data || error.message
    );

    return {
      strengths: [],
      improvements: [],
      recommendations: [
        'Unable to generate AI recommendations.'
      ],
      recruiterImpression:
        'AI analysis unavailable currently.',
      summary:
        'Please try again later.'
    };
  }
}

module.exports = analyzeResumeWithGroq;