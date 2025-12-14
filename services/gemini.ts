import { GoogleGenAI, Chat } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.API_KEY || '';
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const createChatSession = (model: string, systemInstruction?: string): Chat => {
  return getAI().chats.create({
    model: model,
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const streamMessage = async (
  chat: Chat,
  message: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
};

export const testConnection = async (model: string = 'gemini-2.5-flash'): Promise<boolean> => {
  try {
    // Attempt a minimal generation to verify API key and connectivity
    await getAI().models.generateContent({
      model,
      contents: { parts: [{ text: 'ping' }] },
      config: {
        maxOutputTokens: 1,
      }
    });
    return true;
  } catch (e) {
    console.error("Gemini Connection Test Failed:", e);
    return false;
  }
};