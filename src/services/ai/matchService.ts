






import { genAI } from "./aiClient";
import { validateMatchInput } from "../../validations/ai.validation";
export const matchSolver = async (problem: any, solvers: any[]) => {
 
  
  try{
validateMatchInput(problem, solvers);

  const prompt = `
You are an expert matching system.

PROBLEM:
Title: ${problem.refinedTitle || problem.title}
Tags: ${problem.tags?.join(", ") || "none"}
Difficulty:${problem.difficulty || 'Medium'}

SOLVERS:
${JSON.stringify(solvers.map(s =>({
  id:s._id,
  name:s.name,
  skills:s.skills || [],
  repScore:s.repScore || 0,
  rating:s.rating?.avg || 0
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

 const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"});
 const result=await model.generateContent(prompt);
 const response=await result.response;
 const content=response.text();


if(!content){
  throw new Error("No content found");
}
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  }catch(err){
    console.error("Matching Error: ",err);
    return {
        matches:[],
        messsage:"Matching temporarily unavailable"
      }
    
  }
  
};