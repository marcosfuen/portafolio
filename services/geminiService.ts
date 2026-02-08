
import { GoogleGenAI } from "@google/genai";

// Improve the professional bio or project description using Gemini.
export async function improveDescription(text: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Improve the following professional bio or project description to make it sound more compelling and professional, while keeping it concise: "${text}"`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return text;
  }
}

// Suggest modern portfolio project ideas using Gemini based on a given niche.
export async function suggestProjectIdeas(niche: string): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 modern portfolio project ideas for a developer specializing in ${niche}. Return as a simple list.`,
    });
    return response.text?.split('\n').filter(l => l.trim()) || [];
  } catch (error) {
    return ["Project Alpha", "Project Beta", "Project Gamma"];
  }
}
