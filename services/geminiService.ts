import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Export the initialized instance
export { genAI };