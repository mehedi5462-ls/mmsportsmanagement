import { GoogleGenAI } from "@google/genai";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// Assume this variable is pre-configured and accessible in the execution context.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProductionInsights = async (productionData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following garment production data and provide a short, motivating summary in Bengali for the manager.
      Data: ${JSON.stringify(productionData)}`,
      config: {
        systemInstruction: "You are a professional factory management consultant. Keep it concise, professional and helpful.",
      },
    });
    
    // The text property directly returns the string output.
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "উপাত্ত বিশ্লেষণ করা সম্ভব হচ্ছে না এই মুহূর্তে।";
  }
};
