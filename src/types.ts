export interface ExamRecord {
  id: string;
  date: string;
  analyte: string;
  value: number;
  unit: string;
  referenceRange: string;
  category: 'blood' | 'urine' | 'imaging' | 'other';
  imageUrl?: string;
}

export interface WearableData {
  timestamp: string;
  steps: number;
  heartRate: number;
  sleepHours: number;
  spO2: number;
}

export interface CheckUpResponse {
  date: string;
  fatigue: number; // 1-10
  stress: number; // 1-10
  notes: string;
}
