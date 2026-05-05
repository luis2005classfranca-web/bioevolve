import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" })); // Increased limit for larger PDFs and high-res images

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// API Route for Gemini
app.post("/api/gemini", async (req, res) => {
  try {
    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "No document provided" });
    }

    const mimeTypeMatch = base64Image.match(/^data:([^;]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const data = base64Image.split(',')[1];

    console.log(`Processing document: MIME=${mimeType}, size=${Math.round(base64Image.length / 1024 / 1024)}MB`);

    const prompt = `
      Você é um motor de inteligência em saúde de altíssima precisão especializado em análise de documentos desestruturados (PDFs, imagens, tabelas complexas).

      OBJETIVO:
      Extrair e interpretar métricas de saúde com máxima precisão, mesmo em documentos com texto bagunçado, caracteres corrompidos, encoding quebrado ou colunas desalinhadas.

      PIPELINE DE PROCESSAMENTO:
      1. Saneamento e Limpeza (OCR Avançado):
         - Limpe caracteres corrompidos (ex: símbolos estranhos como , □).
         - Normalize texto: remova espaços extras, corrija encoding.
         - Normalize números: "74,1" -> 74.1, "24%" -> 24.
         - Unifique unidades: kg, %, kcal, mg/dL, etc.

      2. Mapeamento Flexível (NLP Contextual):
         Identifique métricas baseado no contexto, não apenas na posição:
         - PESO: ["peso", "weight", "massa corporal", "body weight", "masa"]
         - ALTURA: ["altura", "height", "estatura", "stature"]
         - IMC: ["imc", "bmi", "índice de massa corporal"]
         - GORDURA_PERCENTUAL: ["gordura", "body fat", "% gordura", "percentual de gordura", "fat rate"]
         - MASSA_MUSCULAR: ["massa muscular", "muscle mass", "músculo"]
         - GORDURA_VISCERAL: ["gordura visceral", "visceral fat", "level visceral"]
         - TMB: ["taxa metabólica", "basal metabolic rate", "tmb", "bmr"]
         - ÁGUA: ["água corporal", "total body water", "tbw"]

      3. Inteligência Extra e Fallback:
         - Se houver Peso e Altura (em metros), calcule o IMC se ele estiver ausente: IMC = Peso / (Altura * Altura).
         - Identifique a data do exame. Se não encontrar, use a data atual.
         - Se um valor estiver ilegível, retorne null para esse campo específico em vez de inventar dados.

      SAÍDA ESPERADA:
      Retorne SEMPRE um ARRAY de objetos no formato JSON. Se for um exame de bioimpedância, extraia cada métrica como um item do array. Se for laboratorial, extraia cada analito.

      Formato:
      [{
        "date": "YYYY-MM-DD",
        "category": "biometry" | "laboratory" | "other",
        "analyte": "Nome Padronizado (ex: Peso, Glicose, Gordura Percentual)",
        "label": "Termo original encontrado no documento",
        "value": number (apenas o número, ex: 75.5),
        "unit": "unidade padronizada (ex: kg, %, mg/dL)",
        "referenceRange": "intervalo de referência se disponível",
        "confidence": 0-100 (score de confiança na extração),
        "isCalculated": boolean (true se foi calculado por você, ex: IMC)
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

    if (!response.text) {
      console.error("Gemini returned empty text. Safety filters or processing error?");
      return res.status(500).json({ error: "O modelo não conseguiu extrair dados do documento." });
    }

    const text = response.text;
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({ error: `Falha ao processar documento: ${errorMessage}` });
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
