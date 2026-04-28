import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Camera, 
  Activity, 
  ShieldCheck, 
  ChevronLeft,
  Heart,
  AlertCircle
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

const steps = [
  {
    title: "Bem-vindo ao BioEvolve",
    desc: "Sua jornada para uma saúde baseada em dados começa aqui.",
    icon: (
      <img 
        src="https://raw.githubusercontent.com/antigravity-internal/media/main/bioevolve-logo.png" 
        alt="Logo" 
        className="w-16 h-16 object-contain"
        referrerPolicy="no-referrer"
      />
    ),
  },
  {
    title: "Questionário Inicial",
    desc: "Conte-nos um pouco sobre seu histórico de saúde.",
    isForm: true,
  },
  {
    title: "Como usar",
    desc: "Aprenda a tirar o máximo proveito do app.",
    instructions: [
      { icon: <Camera />, text: "Digitalize seus exames físicos tirando uma foto." },
      { icon: <Activity />, text: "Monitore tendências de biometria ao longo do tempo." },
      { icon: <ShieldCheck />, text: "Compartilhe dados com seu médico de forma segura." }
    ]
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ userId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    conditions: [] as string[],
    allergies: '',
    medications: '',
    goals: ''
  });

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save to Firestore
      const profilePath = `users/${userId}/profile/initial`;
      try {
        await setDoc(doc(db, profilePath), {
          ...formData,
          onboardingComplete: true,
          completedAt: new Date().toISOString()
        });
        onComplete();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, profilePath);
      }
    }
  };

  const toggleCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition) 
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }));
  };

  const commonConditions = ["Diabetes", "Hipertensão", "Colesterol Alto", "Problemas Cardíacos", "Asma"];

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-8"
          >
            <div className="text-center space-y-4">
              {steps[currentStep].icon && (
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  {steps[currentStep].icon}
                </div>
              )}
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {steps[currentStep].title}
              </h1>
              <p className="text-slate-500 font-medium">
                {steps[currentStep].desc}
              </p>
            </div>

            {steps[currentStep].isForm && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-700">Você possui alguma dessas condições?</p>
                  <div className="flex flex-wrap gap-2">
                    {commonConditions.map(c => (
                      <button
                        key={c}
                        onClick={() => toggleCondition(c)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          formData.conditions.includes(c) 
                            ? 'bg-indigo-600 text-white shadow-lg' 
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alergias ou Medicamentos</label>
                    <textarea 
                      value={formData.allergies}
                      onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                      placeholder="Ex: Alergia a Penicilina, uso diário de..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Objetivo Médicos</label>
                    <input 
                      value={formData.goals}
                      onChange={(e) => setFormData({...formData, goals: e.target.value})}
                      placeholder="Ex: Melhorar condicionamento, controle de glicemia"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {steps[currentStep].instructions && (
              <div className="space-y-4">
                {steps[currentStep].instructions.map((inst, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                    <div className="text-indigo-600 shrink-0">{inst.icon}</div>
                    <p className="text-sm text-slate-600 font-medium">{inst.text}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 pb-12 w-full max-w-md mx-auto flex gap-4">
        {currentStep > 0 && (
          <button 
            onClick={() => setCurrentStep(currentStep - 1)}
            className="w-16 h-16 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400"
          >
            <ChevronLeft />
          </button>
        )}
        <button 
          onClick={handleNext}
          className="flex-1 bg-indigo-600 text-white h-16 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
        >
          {currentStep === steps.length - 1 ? 'Começar agora' : 'Continuar'}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
