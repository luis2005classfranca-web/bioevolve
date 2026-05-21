export const extractExams = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch('/api/extract', { method: 'POST', body: formData });
  if (!response.ok) {
    let errorMsg = "Erro na extração de dados";
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.details || errorMsg;
    } catch {
      try {
        const text = await response.text();
        if (text) errorMsg = text;
      } catch {}
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

export const explainExam = async (data: any) => {
  const response = await fetch('/api/explain', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  if (!response.ok) {
    let errorMsg = "Erro ao explicar exame";
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.details || errorMsg;
    } catch {
      try {
        const text = await response.text();
        if (text) errorMsg = text;
      } catch {}
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

export const getInsight = async (examId: string) => {
  const response = await fetch('/api/insight', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ examId })
  });
  if (!response.ok) {
    let errorMsg = "Erro ao obter análise";
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.details || errorMsg;
    } catch {
      try {
        const text = await response.text();
        if (text) errorMsg = text;
      } catch {}
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

export const analyzeExam = async (data: any) => {
  const response = await fetch('/api/explain', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  if (!response.ok) {
    let errorMsg = "Erro ao analisar o exame";
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.details || errorMsg;
    } catch {
      try {
        const text = await response.text();
        if (text) errorMsg = text;
      } catch {}
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

export const analyzeAllHistory = async (history: any[]) => {
  const response = await fetch('/api/analyze-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history })
  });
  if (!response.ok) {
    let errorMsg = "Erro ao gerar análise completa";
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.details || errorMsg;
    } catch {
      try {
        const text = await response.text();
        if (text) errorMsg = text;
      } catch {}
    }
    throw new Error(errorMsg);
  }
  return response.json();
};
