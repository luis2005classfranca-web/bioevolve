import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" })); // Increased limit for image data

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// API Route for Gemini
app.post("/api/gemini", async (req, res) => {
  try {
    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const data = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const prompt = `
      Extract health exam data from this image. Only return a JSON array as response.
      - Date of exam (ISO or YYYY-MM-DD or Unknown/Current Year)
      - Analyte name (e.g., Glucose)
      - Numeric value
      - Unit (e.g., mg/dL)
      - Reference Range
      - Category (blood, urine, imaging, other)
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              analyte: { type: Type.STRING },
              value: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              referenceRange: { type: Type.STRING },
              category: { type: Type.STRING, enum: ["blood", "urine", "imaging", "other"] }
            },
            required: ["date", "analyte", "value", "unit"]
          }
        }
      }
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error) {
    console.error("Gemini proxy error:", error);
    res.status(500).json({ error: "Failed to process image" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
