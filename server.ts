import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import multer from 'multer';

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set.");
  }
  const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  }) : null;

  app.use(express.json({ limit: '50mb' }));

  // Helper for transient / quota / rate limit errors
  function isGeminiTransientError(error: any) {
    if (!error) return false;
    const msg = error.message || String(error);
    const status = error.status || (error.error && error.error.code);
    return status === 429 || status === 503 || msg.includes('429') || msg.includes('Quota') || msg.includes('UNAVAILABLE') || msg.includes('RESOURCE_EXHAUSTED');
  }

  // Automatic retry wrapper for GenAI to swallow and retry 503 Service Unavailable and 429 Rate Limits
  async function generateWithRetry(params: any, retries = 3, delay = 1500): Promise<any> {
    if (!ai) throw new Error("Cliente GenAI não inicializado.");
    try {
      return await ai.models.generateContent(params);
    } catch (e: any) {
      if (isGeminiTransientError(e) && retries > 0) {
        console.warn(`Transient Gemini API error encountered (${e.status || '503/429'}). Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateWithRetry(params, retries - 1, delay * 2);
      }
      throw e;
    }
  }

  // API routes
  app.post("/api/extract", upload.single('image'), async (req, res) => {
    const file = (req as any).file;
    if (!file || !ai) return res.status(400).json({ error: 'No image or model' });
    
    const base64Content = file.buffer.toString('base64');
    
    try {
        const response = await generateWithRetry({
            model: "gemini-3.1-flash-lite",
            contents: [
                { inlineData: { data: base64Content, mimeType: file.mimetype } },
                "Extraia até no máximo os 5 a 6 marcadores e exames de saúde principais e mais relevantes deste documento, focando nos indicadores gerais mais importantes (como Glicose, Colesterol, Hemoglobina, Ureia, Creatinina, ou TSH) e priorizando de forma clara quaisquer resultados que estejam visivelmente alterados ou fora do intervalo de referência. Evite subdivisões irrelevantes, listas de dezenas de microssubdivisões ou poluição de dados repetitivos para economizar espaço de armazenamento e deixar a gestão do paciente mais direta e fácil de entender. Para cada marcador relevante encontrado, preencha as propriedades incluindo uma frase direta e descritiva em português no campo 'feedback' interpretando aquele resultado."
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            analyte: { type: Type.STRING, description: "Nome direto do exame principal (ex: Glicose, Hemoglobina, Colesterol Total, Creatinina)" },
                            value: { type: Type.STRING, description: "Valor do resultado (ex: 90, 12.5, < 0.5)" },
                            unit: { type: Type.STRING, description: "Unidade de medida (ex: mg/dL, g/dL, UI/L, %)" },
                            referenceRange: { type: Type.STRING, description: "Intervalo de referência correspondente (ex: 70 - 99, < 200)" },
                            date: { type: Type.STRING, description: "Data de realização no formato YYYY-MM-DD" },
                            feedback: { type: Type.STRING, description: "Interpretação descritiva e direta em uma única frase amigável do que o resultado significa ou se ele está equilibrado/alterado em português." }
                        },
                        required: ["analyte", "value", "feedback"]
                    }
                }
            }
        });
        const text = response.text || '[]';
        res.json(JSON.parse(text));
    } catch(e: any) {
        console.error("Extraction error:", e);
        if (isGeminiTransientError(e)) {
            res.status(429).json({ error: 'O serviço do Gemini está temporariamente sobrecarregado ou indisponível. Por favor, aguarde alguns instantes e tente novamente.' });
        } else {
            res.status(500).json({ error: 'Erro na extração', details: e.message || String(e) });
        }
    }
  });

  app.post("/api/explain", async (req, res) => {
     if (!ai) return res.status(400).json({ error: 'Model not available' });
     const { data } = req.body;
     try {
         const response = await generateWithRetry({
             model: "gemini-3.1-flash-lite",
             contents: [
                 "Explique estes resultados de exame de forma simples para um paciente: " + JSON.stringify(data)
             ]
         });
         console.log("Full response from Gemini:", JSON.stringify(response));
         res.json({ explanation: response.text });
     } catch (e: any) {
         console.error("Explanation error:", e);
         if (isGeminiTransientError(e)) {
             res.status(429).json({ error: 'O serviço do Gemini está temporariamente sobrecarregado ou indisponível. Por favor, aguarde alguns instantes e tente novamente.' });
         } else {
             res.status(500).json({ error: 'Erro ao explicar resultados', details: e.message || String(e) });
         }
     }
  });

  app.post("/api/insight", async (req, res) => {
     if (!ai) return res.status(400).json({ error: 'Model not available' });
     const { clickedExam, history } = req.body;
     try {
         const response = await generateWithRetry({
             model: "gemini-3.1-flash-lite",
             contents: [
                 `Analise o seguinte resultado de exame: ${JSON.stringify(clickedExam)}.
                 Compare com o histórico do paciente se houver: ${JSON.stringify(history)}.
                 Forneça uma análise simples e esclarecedora para o paciente sobre esse marcador específico e sua evolução se possível.`
             ]
         });
         res.json({ insight: response.text });
     } catch (e: any) {
         console.error("Insight error:", e);
         if (isGeminiTransientError(e)) {
             res.status(429).json({ error: 'O serviço do Gemini está temporariamente sobrecarregado ou indisponível. Por favor, aguarde alguns instantes e tente novamente.' });
         } else {
             res.status(500).json({ error: 'Erro ao gerar análise', details: e.message || String(e) });
         }
     }
  });

  app.post("/api/analyze-all", async (req, res) => {
     if (!ai) return res.status(400).json({ error: 'Model not available' });
     const { history } = req.body;
     try {
         const response = await generateWithRetry({
             model: "gemini-3.1-flash-lite",
             contents: [
                 `Você é um assistente médico especialista em análise de exames laboratoriais.
                 Analise todo o histórico de exames do paciente de forma descritiva e detalhada:
                 ${JSON.stringify(history)}.
                 
                 Por favor, formule sua resposta em português (PT-BR) com as seguintes seções estruturadas usando Markdown (formatação limpa, profissional e amigável):
                 1. **Visão Geral**: Resumo geral estruturado sobre a saúde do paciente com base nos exames fornecidos.
                 2. **Histórico e Evolução Temporal**: Compare os exames de datas diferentes. Identifique tendências positivas, estabilidade ou piora nos marcadores de saúde.
                 3. **Exames Alterados ou de Atenção**: Chame atenção especial para valores que estão fora das faixas normais.
                 4. **Ações Recomendadas e Próximos Passos**: Recomendações gerais sobre estilo de vida ou orientação para consultar profissionais de saúde.`
             ]
         });
         res.json({ analysis: response.text });
     } catch (e: any) {
         console.error("General analysis error:", e);
         if (isGeminiTransientError(e)) {
             res.status(429).json({ error: 'O serviço do Gemini está temporariamente sobrecarregado ou indisponível. Por favor, aguarde alguns instantes e tente novamente.' });
         } else {
             res.status(500).json({ error: 'Erro ao gerar análise histórica descritiva', details: e.message || String(e) });
         }
     }
  });

  // Vite middleware for development
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

  // Global JSON error handler to catch all Express / Multer exceptions and return clean JSON instead of HTML
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global server error caught:", err);
    res.status(err.status || 500).json({
      error: err.error || "Erro interno do servidor",
      details: err.message || String(err)
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
