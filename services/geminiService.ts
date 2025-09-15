
import { GoogleGenAI, Type } from "@google/genai";
import type { StructuredBook } from '../types';

if (!process.env.API_KEY) {
  // In a real app, this would be handled by the environment.
  // For this example, we'll alert the user if it's missing.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
  process.env.API_KEY = "YOUR_API_KEY_HERE";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const bookSchema = {
    type: Type.OBJECT,
    properties: {
        title: { 
            type: Type.STRING,
            description: "The main title of the book. Infer this from the text." 
        },
        author: { 
            type: Type.STRING,
            description: "The author of the book. If not found, use 'Unknown Author'." 
        },
        chapters: {
            type: Type.ARRAY,
            description: "An array of chapters that make up the book.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { 
                        type: Type.STRING,
                        description: "The title of this chapter."
                    },
                    content: { 
                        type: Type.STRING,
                        description: "The full content of the chapter, formatted as a single string of well-formed XHTML. Use <p> for paragraphs and <h2> or <h3> for subheadings."
                    },
                },
                required: ["title", "content"],
            },
        },
    },
    required: ["title", "author", "chapters"],
};

/**
 * Uses Gemini to analyze raw text and structure it into a book format.
 * @param text The raw text extracted from a PDF.
 * @param onProgress Callback to report progress (not used in this simple version, but here for future extension).
 * @returns A promise that resolves to a StructuredBook object.
 */
export const structureContentWithAI = async (text: string, onProgress: (progress: number) => void): Promise<StructuredBook> => {
    // A simple progress simulation for the AI step
    onProgress(10); 
    
    const prompt = `
        You are an expert document structurer. I have extracted raw text from a PDF file.
        Your task is to analyze this text and structure it into a valid JSON object representing a book.
        Please identify a plausible title, author, and divide the content into logical chapters.
        Each chapter must have a title and its content formatted as a single string of XHTML.
        Use <p> tags for paragraphs. If you detect headings in the text, use <h2> or <h3> tags for them.
        Ensure the entire output adheres to the provided JSON schema.

        Here is the text:
        ---
        ${text}
        ---
    `;

    if (process.env.API_KEY === "YOUR_API_KEY_HERE") {
        throw new Error("Please configure your Gemini API key in `geminiService.ts`.");
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: bookSchema,
            },
        });
        onProgress(80);

        const jsonString = response.text;
        const structuredData = JSON.parse(jsonString);

        // Basic validation
        if (!structuredData.title || !Array.isArray(structuredData.chapters)) {
            throw new Error("AI returned an invalid book structure.");
        }
        onProgress(100);
        return structuredData as StructuredBook;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("The AI failed to process the document content. The document might be too complex or the content is unstructurable.");
    }
};
