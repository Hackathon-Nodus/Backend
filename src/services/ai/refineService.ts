// import {genAI} from "../ai/aiClient";

// export const refineProblem = async (
//   rawTitle: string,
//   rawDescription: string,
//   category: string | null
// ) => {
//   const prompt = `
// Refine this problem:

// TITLE: ${rawTitle}
// DESCRIPTION: ${rawDescription}
// CATEGORY: ${category || "Not specified"}

// Return JSON:
// {
//   "refinedTitle": "",
//   "refinedDescription": "",
//   "suggestedTags": [],
//   "difficulty": "",
//   "keyPoints": [],
//   "suggestedBudget": 0
// }
// `;

//   const response = await openai.chat.completions.create({
//     model: "gemini-1.5-flash",
//     messages: [{ role: "user", content: prompt }],
//     temperature: 0.7,
//     response_format: { type: "json_object" },
//   });
// const content=response.choices[0]?.message?.content;
//   console.log("AI contents: ",content)
//   return JSON.parse(content || "{}");
// };





import {genAI} from './aiClient';


export const refineProblem=async(
  rawTitle:string,
  rawDesc:string,
  category:string|null
)=>{
  try{
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

   const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"});

   const result=await model.generateContent(prompt);
   const response= await result.response;

   const content=response.text();

   if(!content){
       throw new Error("No content recieved")
    }
  
console.log("AI Contents: ",content);
let cleanContent= content?.replace(/```json/g, '').replace(/```/g, '').trim();
return JSON.parse(cleanContent);
  }catch(error){
          console.error("Refine Error:", error);

          return{
            refinedTitle:rawTitle,
            refinedDesc:rawDesc,
            suggestedTags:['problem-solving',category || 'general'],
            difficulty:'medium',
            suggestedBudget:100

          }
  }
}