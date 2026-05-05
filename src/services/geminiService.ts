/// <reference types="vite/client" />
export interface HealthDataPoint {
  date: string;
  category: 'biometry' | 'laboratory' | 'other';
  analyte: string;
  label?: string;
  value: number;
  unit: string;
  referenceRange?: string;
  confidence?: number;
  isCalculated?: boolean;
}

export async function extractHealthDataFromImage(base64Image: string): Promise<HealthDataPoint[]> {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const endpoint = `${baseUrl}/api/gemini`;
    
    // Client-side size check (approximate MB)
    const sizeInMB = (base64Image.length * 0.75) / (1024 * 1024);
    if (sizeInMB > 30) {
      throw new Error("O arquivo é muito grande (acima de 30MB). Por favor, tente um arquivo menor ou uma imagem com resolução reduzida.");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error("O arquivo excede o limite permitido pelo servidor. Tente reduzir o tamanho do PDF ou da imagem.");
      }
      
      let errorMessage = `Erro no servidor (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMessage = errorData.error;
      } catch (e) {
        // Fallback to status text
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (e) {
    console.error("Gemini extraction error:", e);
    throw e;
  }
}
