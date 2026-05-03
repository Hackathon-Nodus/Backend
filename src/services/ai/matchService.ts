

import { generateJson } from './aiClient';
import { validateMatchInput } from "../../validations/ai.validation";

interface MatchResult {
  matches: Array<{
    solverId: string;
    matchScore: number;
    reason: string;
    confidence: string;
  }>;
  topPick?: string;
  message?: string;
}

export const matchSolver = async (problem: any, solvers: any[]) => {
  try {
    validateMatchInput(problem, solvers);

    const prompt = `
You are an expert matching system.

PROBLEM:
Title: ${problem.refinedTitle || problem.title}
Tags: ${problem.tags?.join(", ") || "none"}
Difficulty:${problem.difficulty || 'Medium'}

SOLVERS:
${JSON.stringify(solvers.map(s => ({
      id: s._id,
      name: s.name,
      skills: s.skills || [],
      repScore: s.repScore || 0,
      rating: s.rating?.avg || 0
    })), null, 2)}

Return ONLY valid JSON:
{
  "matches": [
    {
      "solverId": "id_string",
      "matchScore": 85,
      "reason": "why this solver fits",
      "confidence": "High"
    }
  ],
  "topPick": "solverId"
}

`;

    const fallback: MatchResult = {
      matches: [],
      message: 'Matching temporarily unavailable'
    };

    return await generateJson<MatchResult>(prompt, fallback);
  } catch (err) {
    console.error("Matching Error: ", err);
    return {
      matches: [],
      message: "Matching temporarily unavailable"
    } as MatchResult;

  }

};