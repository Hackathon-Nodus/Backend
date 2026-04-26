
import { generateJson } from './aiClient';

export interface RefineResult {
  refinedTitle: string;
  refinedDesc: string;
  suggestedTags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedBudget: number;
}


export const refineProblem=async(
  rawTitle:string,
  rawDesc:string,
  category:string|null
) : Promise<RefineResult> => {
  const fallback: RefineResult = {
    refinedTitle: rawTitle,
    refinedDesc: rawDesc,
    suggestedTags: ['problem-solving', category || 'general'],
    difficulty: 'medium',
    suggestedBudget: 100
  };

   const prompt=`Refine this problem: 
   
   TITLE:${rawTitle}
   Desc:${rawDesc}
   CATEGORY:${category||"Not specified"}

   Rerurn only valid JSON
   {
   refinedTitle:"clear professional title under 60 chars",
   refinedDesc:"enhanced description with context,requirements, and expected outcomes",
   suggestedTags:["tag1","tag2"],
   "difficulty":"easy/medium/hard",
   "suggestedBudget":100
   }
   `;

   return generateJson<RefineResult>(prompt, fallback);
};