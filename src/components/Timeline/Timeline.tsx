import { useState, useEffect } from 'react';
import { getExams, Exam, clearExams } from '../../lib/storage';
import { Sparkles } from 'lucide-react';

export function Timeline() {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    setExams(getExams());
  }, []);

  const exportCSV = () => {
    const headers = ["Data", "Analyte", "Value", "Unit", "ReferenceRange"];
    const rows = exams.map(e => [e.examDate, e.analyte || 'N/A', e.value || 'N/A', e.unit || 'N/A', e.referenceRange || 'N/A']);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell || ''}"`).join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "historico_exames.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [fullAnalysis, setFullAnalysis] = useState<string | null>(null);
  const [loadingFullAnalysis, setLoadingFullAnalysis] = useState(false);

  const requestInsight = async (exam: Exam) => {
    setLoadingInsight(true);
    setInsight(null);
    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clickedExam: exam, history: exams })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || "Erro desconhecido");
      }
      setInsight(data.insight);
    } catch (e: any) {
      alert(`Erro ao gerar análise: ${e.message || e}`);
      console.error(e);
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleFullAnalysis = async () => {
    setLoadingFullAnalysis(true);
    setFullAnalysis(null);
    try {
      const response = await fetch('/api/analyze-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: exams })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || "Erro desconhecido");
      }
      setFullAnalysis(data.analysis);
    } catch (e: any) {
      alert(`Erro ao gerar análise descritiva dos exames: ${e.message || e}`);
      console.error(e);
    } finally {
      setLoadingFullAnalysis(false);
    }
  };

  // Grouper
  const groupedExams = exams.reduce((acc, exam) => {
    (acc[exam.examDate] = acc[exam.examDate] || []).push(exam);
    return acc;
  }, {} as Record<string, Exam[]>);
  const dates = Object.keys(groupedExams).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());


  const clearHistory = () => {
    if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
      clearExams();
      setExams([]);
      window.location.reload();
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="font-bold text-slate-800 text-xl">Histórico de Exames</h3>
        {exams.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleFullAnalysis} 
              disabled={loadingFullAnalysis}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles size={16} />
              {loadingFullAnalysis ? "Analisando..." : "Análise Descritiva Completa"}
            </button>
            <button onClick={exportCSV} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200">
              Exportar CSV
            </button>
            <button onClick={clearHistory} className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200">
              Limpar Histórico
            </button>
          </div>
        )}
      </div>

      {loadingFullAnalysis && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 text-center shadow-inner animate-pulse">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="font-bold text-slate-800">Elaborando laudo descritivo completo dos exames...</p>
            <p className="text-xs text-slate-500">Isso pode levar alguns segundos, comparando as tendências de todos os seus marcadores de saúde.</p>
          </div>
        </div>
      )}

      {fullAnalysis && (
        <div id="full-analysis-card" className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 mb-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button 
              onClick={() => setFullAnalysis(null)} 
              className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              aria-label="Fechar análise"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Sparkles size={20} />
            </div>
            <h4 className="font-bold text-lg text-indigo-900">Análise Descritiva Histórica da IA</h4>
          </div>
          <div className="text-slate-700 text-sm whitespace-pre-line leading-relaxed space-y-2">
            {fullAnalysis}
          </div>
        </div>
      )}

      {insight && (
        <div className="bg-amber-50 p-4 rounded-xl mb-6 border border-amber-200 text-amber-900 text-sm">
          <p className="font-bold flex justify-between">
            Análise do AI:
            <button onClick={() => setInsight(null)} className="text-xs underline">Fechar</button>
          </p>
          <p className="mt-1">{insight}</p>
        </div>
      )}

      {loadingInsight && <div className="text-center p-4">Analisando...</div>}

      {exams.length === 0 ? (
        <div className="text-slate-500">Nenhum exame encontrado no histórico.</div>
      ) : (
        <div className="space-y-6">
          {dates.map(date => (
            <div key={date}>
              <h4 className="font-bold text-lg text-slate-700 mb-2">{date}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-800">
                      <th className="py-2">Analyte</th>
                      <th className="py-2">Value</th>
                      <th className="py-2">Unit</th>
                      <th className="py-2">Ref Range</th>
                      <th className="py-2">Análise</th>
                      <th className="py-2">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedExams[date].map((e, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-none">
                        <td className="py-3">{e.analyte}</td>
                        <td className="py-3 font-semibold text-slate-900">{e.value}</td>
                        <td className="py-3">{e.unit}</td>
                        <td className="py-3">{e.referenceRange}</td>
                        <td className="py-3 text-xs text-slate-500 max-w-xs">{e.feedback || '-'}</td>
                        <td className="py-3">
                          <button 
                            onClick={() => requestInsight(e)} 
                            className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100"
                            title="Analisar com IA"
                          >
                            <Sparkles size={12}/> Analisar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
