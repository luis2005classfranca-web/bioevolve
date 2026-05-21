import React, { useState } from 'react';
import { extractExams, explainExam, analyzeExam } from '../../services/geminiService';
import { saveExam } from '../../lib/storage';
import { Sparkles, FileEdit, Brain, Calendar, X, AlertCircle } from 'lucide-react';

export function HealthScan() {
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [examDate, setExamDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  const handleExplain = async () => {
    setLoadingExplanation(true);
    setExplanation(null);
    setIsExplanationModalOpen(true);
    try {
      const result = await explainExam(extractedData);
      setExplanation(result.explanation);
    } catch (error) {
      console.error('Explanation error:', error);
      setExplanation('Erro ao obter explicação. Tente novamente.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const validateField = (field: string, value: string) => {
      if (field === 'analyte') return value.trim() ? '' : 'Obrigatório';
      if (field === 'value' || field === 'referenceRange') return /^\s*(\d+(\.\d+)?(\s*-\s*\d+(\.\d+)?)?|<|>|\d+)\s*$/.test(value) ? '' : 'Formato inválido';
      if (field === 'unit') return value.trim().length > 0 && value.trim().length <= 10 ? '' : 'Inválido';
      return '';
  };

  const handleDataChange = (idx: number, field: string, value: string) => {
    const newData = Array.isArray(extractedData) ? [...extractedData] : [{ ...extractedData }];
    newData[idx] = { ...newData[idx], [field]: value };
    setExtractedData(Array.isArray(extractedData) ? newData : newData[0]);
    
    const error = validateField(field, value);
    setErrors(prev => ({
        ...prev,
        [idx]: { ...(prev[idx] || {}), [field]: error }
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      try {
        const data = await extractExams(e.target.files[0]);
        console.log('Extracted:', data);
        setExtractedData(data);
      } catch (error) {
        console.error('Extraction error:', error);
        alert('Erro ao extrair dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmSave = async () => {
    if (!examDate) {
      alert('Por favor, selecione a data do exame.');
      return;
    }
    
    // Validate if there are any current errors
    const hasErrors = Object.values(errors).some(rowErrors => Object.values(rowErrors).some(err => err !== ''));
    if (hasErrors) {
        alert('Corrija os erros antes de salvar.');
        return;
    }
    
    setLoading(true);
    try {
      const examsToSave = Array.isArray(extractedData) ? extractedData : [extractedData];
      
      for (const ex of examsToSave) {
        let feedback = ex.feedback;
        if (!feedback) {
          try {
            const analysisResult = await analyzeExam(ex);
            feedback = analysisResult.explanation || 'Valor cadastrado com sucesso.';
          } catch (err) {
            console.error('Erro na análise automática do analito:', err);
            feedback = 'Analito registrado no histórico.';
          }
        }
        saveExam({ ...ex, examDate, feedback });
      }

      alert('Dados salvos com sucesso!');
      setExtractedData(null);
      setExamDate('');
      setErrors({}); // Reset errors
    } catch (e) {
      alert('Erro ao salvar exames. Tente novamente.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setExtractedData(null);
    setExamDate('');
  };

  return (
    <div className={`bg-white rounded-3xl transition-all duration-300 ${
      extractedData 
        ? 'border border-slate-200 p-8 shadow-sm' 
        : 'border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 hover:border-slate-300'
    }`}>
      {extractedData ? (
        <div className="w-full text-left">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Leitura Concluída
              </span>
              <h2 className="text-xl font-bold text-slate-800 mt-2">Dados Detectados</h2>
              <p className="text-slate-500 text-sm mt-0.5">Revise os valores extraídos automaticamente antes de salvar.</p>
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100 shadow-sm cursor-pointer"
              id="view-edit-results-btn"
            >
              <FileEdit size={16} />
              Revisar & Editar Exames ({Array.isArray(extractedData) ? extractedData.length : 1})
            </button>
          </div>

          {/* SPOTLIGHT BANNER: Explique com IA Button Spotlight */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white mb-6 shadow-lg shadow-indigo-100 border border-indigo-500/20">
            {/* Visual background accents */}
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-3 translate-y-3 pointer-events-none">
              <Brain size={144} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/15 text-indigo-100 mb-3 backdrop-blur-sm">
                  <Sparkles size={12} className="text-amber-300 fill-amber-300" />
                  Análise Instantânea Inteligente
                </span>
                <h3 className="text-lg font-bold text-white mb-1.5 leading-snug">Quer entender seus resultados de forma simples?</h3>
                <p className="text-indigo-100 text-xs leading-relaxed opacity-95">
                  Nossa Inteligência Artificial traduz termos médicos complicados, explica seus níveis e gera um laudo amigável para você ler sem mistérios.
                </p>
              </div>

              <button
                onClick={handleExplain}
                id="explain-results-badge-button"
                className="w-full md:w-auto px-6 py-4 bg-white hover:bg-slate-100 text-indigo-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm whitespace-nowrap active:scale-98 border-2 border-white"
              >
                <Sparkles size={18} className="text-indigo-600 fill-indigo-200 animate-pulse" />
                Explicar Resultados com IA
              </button>
            </div>
          </div>

          {/* Explanation Modal */}
          {isExplanationModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Sparkles size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Análise e Explicação da IA</h3>
                  </div>
                  <button 
                    onClick={() => setIsExplanationModalOpen(false)} 
                    className="p-1 px-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors font-bold text-sm cursor-pointer"
                    aria-label="Fechar"
                  >
                    ✕
                  </button>
                </div>
                
                {loadingExplanation ? (
                  <div className="flex flex-col items-center justify-center py-16 flex-1">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-800 font-bold text-base">Analisando seus dados...</p>
                    <p className="text-slate-400 text-xs mt-1 max-w-xs text-center leading-relaxed">
                      Traduzindo terminologias médicas e criando uma interpretação amigável do seu exame...
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto mb-6 pr-1 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="whitespace-pre-line leading-relaxed text-slate-700 text-sm font-normal space-y-3">
                      {explanation}
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <button
                    onClick={() => setIsExplanationModalOpen(false)}
                    className="w-full px-5 py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm text-sm cursor-pointer"
                  >
                    Entendido, fechar
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                      <FileEdit size={18} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Resultados Detectados</h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="p-1 px-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors font-bold text-sm cursor-pointer"
                    aria-label="Fechar"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="overflow-x-auto mb-6 border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-sm text-slate-600 border-collapse">
                    <thead className="bg-slate-50/75 border-b border-slate-100">
                      <tr>
                        <th className="p-3 font-semibold text-slate-700">Analito / Exame</th>
                        <th className="p-3 font-semibold text-slate-700">Valor</th>
                        <th className="p-3 font-semibold text-slate-700">Unidade</th>
                        <th className="p-3 font-semibold text-slate-700">Intervalo Ref.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(extractedData) ? extractedData : [extractedData]).map((ex: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={ex.analyte || ''} 
                              onChange={(e) => handleDataChange(idx, 'analyte', e.target.value)} 
                              className={`w-full border rounded-xl px-2.5 py-1.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors[idx]?.analyte ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}`} 
                            />
                            {errors[idx]?.analyte && <p className="text-red-500 text-xs mt-1 ml-1">{errors[idx].analyte}</p>}
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={ex.value || ''} 
                              onChange={(e) => handleDataChange(idx, 'value', e.target.value)} 
                              className={`w-full border rounded-xl px-2.5 py-1.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors[idx]?.value ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}`} 
                            />
                            {errors[idx]?.value && <p className="text-red-500 text-xs mt-1 ml-1">{errors[idx].value}</p>}
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={ex.unit || ''} 
                              onChange={(e) => handleDataChange(idx, 'unit', e.target.value)} 
                              className={`w-full border rounded-xl px-2.5 py-1.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors[idx]?.unit ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}`} 
                            />
                            {errors[idx]?.unit && <p className="text-red-500 text-xs mt-1 ml-1">{errors[idx].unit}</p>}
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={ex.referenceRange || ''} 
                              onChange={(e) => handleDataChange(idx, 'referenceRange', e.target.value)} 
                              className={`w-full border rounded-xl px-2.5 py-1.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors[idx]?.referenceRange ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}`} 
                            />
                            {errors[idx]?.referenceRange && <p className="text-red-500 text-xs mt-1 ml-1">{errors[idx].referenceRange}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all text-sm shadow-sm cursor-pointer"
                >
                  Concluir Edição
                </button>
              </div>
            </div>
          )}

          {/* Date Picker Section */}
          <div className="mb-8 bg-slate-50 border border-slate-100 rounded-2xl p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2.5">
              <Calendar size={16} className="text-slate-500" />
              Data de Realização do Exame
            </label>
            <input 
              type="date" 
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full md:max-w-xs px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-750 text-sm"
            />
            <p className="text-slate-400 text-xs mt-1.5">Essencial para organizarmos sua linha do tempo e gráfico histórico de evolução.</p>
          </div>

          {/* Footer action buttons */}
          <div className="flex gap-3 justify-end border-t border-slate-100 pt-5">
            <button 
              onClick={handleCancel} 
              className="px-5 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all text-sm cursor-pointer"
            >
              Excluir carregamento
            </button>
            <button 
              onClick={handleConfirmSave} 
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200/50 transition-all text-sm cursor-pointer"
            >
              Gravar em Minha Saúde
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload de Exame</h2>
          <p className="text-slate-500 text-center max-w-xs mb-8">
            Arraste arquivos PDF ou imagens dos seus exames para análise instantânea pela IA.
          </p>
          
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-600 font-semibold text-sm">Analisando exames...</p>
            </div>
          ) : (
            <label className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 cursor-pointer hover:bg-blue-700 transition-colors">
              Selecionar Arquivo
              <input type="file" accept="image/*, application/pdf" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </>
      )}
    </div>
  );
}
