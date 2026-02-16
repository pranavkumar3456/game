import { GoogleGenAI } from "@google/genai";

// Initialize the client
// Using the new SDK pattern: new GoogleGenAI({ apiKey: ... })
const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
const modelId = "gemini-2.0-flash"; // Updated to current stable version

// Helper to strip markdown code blocks if present
const cleanJSON = (text) => {
    try {
        // Remove markdown code blocks
        let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        console.error("JSON Parse Error:", e, "Input:", text);
        throw e;
    }
};

export const generateEvolution = async (score, currentForm) => {
    try {
        const prompt = `
      You are the Evolution Engine for a cyber-snake game. 
      The player has reached a score of ${score}. 
      Current form: ${JSON.stringify(currentForm)}.
      
      Generate a new evolution stage for the snake.
      Return ONLY a JSON object with this structure:
      {
        "name": "Creative Name",
        "description": "Short, atmospheric description (max 15 words)",
        "ability": "Name of a passive ability (e.g., Speed Boost, Shield, Point Multiplier)",
        "visuals": {
          "headColor": "Hex Code",
          "bodyColor": "Hex Code (should be complementary)"
        }
      }
    `;

        const response = await genAI.models.generateContent({
            model: modelId,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return cleanJSON(response.text);
    } catch (error) {
        console.error("Evolution generation failed:", error);
        // Fallback
        return {
            name: "Glitch Serpent",
            description: "System error detected. Safe mode engaged.",
            ability: "Stability",
            visuals: { headColor: "#FFFFFF", bodyColor: "#888888" }
        };
    }
};

export const generateBiome = async (level) => {
    try {
        const prompt = `
      You are the World Architect for a cyber-snake game.
      The player has reached Level ${level}.
      
      Generate a new themed biome.
      Return ONLY a JSON object with this structure:
      {
        "name": "Creative Biome Name",
        "description": "Atmospheric description (max 10 words)",
        "bgColor": "Hex Code (very dark for contrast)",
        "foodColor": "Hex Code (bright neon)"
      }
    `;

        const response = await genAI.models.generateContent({
            model: modelId,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return cleanJSON(response.text);
    } catch (error) {
        console.error("Biome generation failed:", error);
        return {
            name: "Backup Sector",
            description: "Emergency power only.",
            bgColor: "#050505",
            foodColor: "#00FF00"
        };
    }
};

export const getGuideMessage = async (event, context) => {
    try {
        const prompt = `
      You are "Helix", a witty AI companion in a snake game.
      Event: ${event}
      Context: ${JSON.stringify(context)}
      
      Provide a short, 1-sentence comment or tip. 
      Be encouraging but slightly chaotic/cyberpunk.
      Max 20 words.
    `;

        const response = await genAI.models.generateContent({
            model: modelId,
            contents: prompt
        });

        return response.text;
    } catch (error) {
        console.error("Guide generation failed:", error);
        return "Signal lost...";
    }
};
