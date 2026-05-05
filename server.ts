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
      Você é um motor de inteligência em saúde de alta precisão especializado em análise de documentos desestruturados (PDFs, imagens, tabelas complexas).

      OBJETIVO:
      Extrair e interpretar métricas de saúde com máxima precisão, mesmo em documentos com texto bagunçado, caracteres corrompidos ou colunas desalinhadas.

      INSTRUÇÕES DE NLP E MAPEAMENTO:
      1. Saneamento: Limpe caracteres corrompidos. Normalize "74,1" para 74.1. Remova "%" ou unidades coladas nos números.
      2. Mapeamento Flexível (Dicionário):
         - Peso: ["peso", "weight", "massa corporal", "body weight"]
         - Altura: ["altura", "height", "stature"]
         - Gordura Percentual: ["gordura corporal", "% fat", "body fat", "percentual de gordura"]
         - E assim por diante para: IMC (BMI), Massa Muscular, Gordura Visceral, TMB (BMR), Água Corporal, Idade Metabólica.
      3. Inteligência Extra:
         - Se Peso e Altura estiverem presentes mas não o IMC, calcule: IMC = Peso / (Altura * Altura).
         - Identifique se o documento é um Exame Laboratorial (sangue/urina) ou Bioimpedância (composição corporal).
      4. Confiança: Atribua um score de 0 a 100 baseado na legibilidade e completude.

      Sempre retorne um ARRAY de objetos no formato JSON:
      [{
        "date": "YYYY-MM-DD",
        "category": "biometry" | "laboratory" | "other",
        "analyte": "Nome padronizado (ex: Peso, Glicose, IMC)",
        "label": "Nome original encontrado",
        "value": number,
        "unit": "unidade padronizada",
        "referenceRange": "referência se houver",
        "confidence": 0-100,
        "isCalculated": boolean
      }]
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
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
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "[]";
    res.json(JSON.parse(text));
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
