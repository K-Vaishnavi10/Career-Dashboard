const axios = require('axios');

async function analyzeOverallWithGroq(data) {

  try {

    const prompt = `
You are an expert recruiter and career coach.

Analyze the candidate profile below.

Candidate Scores:
${JSON.stringify(data.scores, null, 2)}

Overall Employability Score:
${data.overallScore}

Existing Action Plan:
${JSON.stringify(data.actionPlan, null, 2)}

Return ONLY valid JSON.

Required JSON format:

{
  "topStrengths": [],
  "topImprovementAreas": [],
  "recommendations": [],
  "weeklyPlan": [],
  "recruiterSummary": ""
}

Rules:

1. "topStrengths"
   - Mention only strongest areas.
   - Maximum 4 points.

2. "topImprovementAreas"
   - Mention only weakest areas.
   - Maximum 4 points.

3. "recommendations"
   - Give actionable career recommendations.
   - Maximum 5 points.

4. "weeklyPlan"
   - Give 5 weekly tasks to improve employability.

5. "recruiterSummary"
   - Give a short recruiter opinion in 2-3 sentences.

IMPORTANT:
- Return ONLY JSON.
- Do NOT use markdown.
- Do NOT use code blocks.
- Do NOT add explanations outside JSON.
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

    console.log(
      '===== OVERALL GROQ RESPONSE ====='
    );

    console.log(content);

    console.log(
      '=================================='
    );

    // Remove markdown if present

    content = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    try {

      const jsonMatch =
        content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error(
          'No JSON object found'
        );
      }

      return JSON.parse(jsonMatch[0]);

    } catch (parseError) {

      console.log(
        'Groq JSON Parse Error'
      );

      console.log(parseError.message);

      return {

        topStrengths: [
          'Resume demonstrates potential.',
          'Candidate has begun building technical profiles.'
        ],

        topImprovementAreas: [
          'Improve low-scoring sections.',
          'Increase consistency across platforms.'
        ],

        recommendations: [
          'Improve GitHub and coding profiles.',
          'Tailor resume for job descriptions.',
          'Maintain an active LinkedIn presence.',
          'Practice DSA consistently.',
          'Build additional portfolio projects.'
        ],

        weeklyPlan: [
          'Solve at least 5 coding problems daily.',
          'Improve one resume section every week.',
          'Contribute to GitHub projects twice a week.',
          'Update LinkedIn profile regularly.',
          'Participate in one coding contest every week.'
        ],

        recruiterSummary:
          'The candidate shows promising technical potential but needs improvements in weaker profile areas to increase recruiter readiness.'

      };
    }

  } catch (error) {

    console.log(
      'Overall Groq Error:',
      error.message
    );

    return {

      topStrengths: [
        'Profile analysis unavailable.'
      ],

      topImprovementAreas: [
        'AI analysis unavailable.'
      ],

      recommendations: [
        'Please try again later.'
      ],

      weeklyPlan: [
        'Continue improving technical skills.'
      ],

      recruiterSummary:
        'Unable to generate recruiter summary.'

    };
  }
}

module.exports = analyzeOverallWithGroq;
