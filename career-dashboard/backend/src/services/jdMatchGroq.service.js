const axios = require('axios');

async function analyzeJDMatchWithGroq(
  resumeText,
  jdText,
  keywordAnalysis
) {

  try {

const prompt = `
You are an ATS (Applicant Tracking System) engine, Senior Technical Recruiter, and Career Coach.

Your task is to compare the candidate's resume against the provided job description exactly as a modern ATS system and recruiter would.

Evaluate the resume ONLY against the requirements mentioned in the job description.

Return ONLY valid JSON.
Do NOT use markdown.
Do NOT add explanations outside JSON.
Do NOT use triple backticks.

Return exactly this JSON structure:

{
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "recommendations": [],
  "summary": ""
}

ANALYSIS INPUT:

Matched Keywords:
${keywordAnalysis.matchedKeywords.join(', ')}

Missing Keywords:
${keywordAnalysis.missingKeywords.join(', ')}

Overall Match Score:
${keywordAnalysis.score}

Resume Text:
"""
${resumeText}
"""

Job Description:
"""
${jdText}
"""

RULES:

1. Focus primarily on the matched and missing keywords while generating the response.

2. "strengths" should mention only the skills, technologies, and experiences that are present in both the resume and job description.

Examples:
[
  "Strong alignment with Java and Spring Boot requirements.",
  "Relevant experience with REST API development.",
  "Good exposure to React and frontend technologies."
]

3. "weaknesses" should mention only missing technologies, skills, certifications, or requirements from the JD.

Examples:
[
  "Cloud technologies such as AWS are missing.",
  "No evidence of Docker or Kubernetes experience."
]

4. "missingSkills" should contain only important technical skills/tools/frameworks that are present in the JD but absent in the resume.

Examples:
[
  "AWS",
  "Docker",
  "Kubernetes"
]

5. "recommendations" should be highly actionable and specific.

Examples:
[
  "Add projects demonstrating Docker usage.",
  "Include AWS deployment experience.",
  "Highlight REST API development work."
]

6. "summary" should be 2-3 concise recruiter-style sentences explaining:
   - Overall suitability for the role.
   - Major strengths.
   - Key gaps preventing a stronger match.

IMPORTANT:

- Do NOT analyze grammar or formatting.
- Do NOT provide generic suggestions.
- Do NOT invent experience, projects, certifications, or skills.
- Base the analysis strictly on the provided resume, job description, and keyword match results.
- Focus only on role relevance and ATS compatibility.
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

    if (!json)
      throw new Error('Invalid JSON');

    return JSON.parse(json[0]);

  } catch (err) {

    console.log(err.message);

    return {

      strengths: [],

      weaknesses: [],

      missingSkills: [],

      recommendations: [],

      summary:
      'Unable to generate AI insights.'

    };
  }
}

module.exports =
analyzeJDMatchWithGroq;