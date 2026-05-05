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
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    console.error("Gemini extraction error:", e);
    throw e;
  }
}
