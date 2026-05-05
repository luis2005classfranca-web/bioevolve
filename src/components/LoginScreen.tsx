import React from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Zap, Heart } from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';

const LoginScreen: React.FC = () => {
  const [loginError, setLoginError] = React.useState(false);

  const handleLogin = async () => {
    try {
      setLoginError(false);
      await loginWithGoogle();
    } catch (e) {
      console.error("Login Error:", e);
      setLoginError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[30%] bg-violet-100/50 rounded-full blur-[100px] -z-10" />

      <main className="flex-1 flex flex-col items-center justify-between p-8 pt-20 pb-12 max-w-md mx-auto w-full">
        {/* Logo & Slogan Area */}
        <div className="w-full space-y-8 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-32 h-32 mx-auto relative group"
          >
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all" />
            <img 
              src="https://raw.githubusercontent.com/antigravity-internal/media/main/bioevolve-logo.png" 
              alt="BioEvolve Logo" 
              className="w-full h-full object-contain relative z-10"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to stylized icon if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.classList.add('bg-gradient-to-br', 'from-indigo-600', 'to-violet-700', 'rounded-[2rem]', 'flex', 'items-center', 'justify-center', 'shadow-2xl');
                const icon = document.createElement('div');
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity text-white"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
                target.parentElement!.appendChild(icon.firstChild!);
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-3"
          >
            <h1 className="text-4xl font-display font-bold tracking-tight text-slate-900">
              Bio<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-500">Evolve</span>
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Sua inteligência de saúde pessoal. <br />
              Digitalize, monitore e evolua.
            </p>
          </motion.div>
        </div>

        {/* Feature Highlights (Trust building) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full grid grid-cols-1 gap-4"
        >
          <FeatureItem 
            icon={<Shield className="text-emerald-500" size={20} />}
            title="Soberania de Dados"
            desc="Seus dados são criptografados e pertencem apenas a você."
          />
          <FeatureItem 
            icon={<Zap className="text-amber-500" size={20} />}
            title="IA Preditiva"
            desc="Transforme PDFs e fotos de exames em tendências claras."
          />
        </motion.div>

        {/* Login Actions */}
          <div className="w-full space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-600 font-medium leading-relaxed">
                <p className="flex items-center gap-2 mb-1 font-bold"><Zap size={12} /> Erro de Conexão</p>
                Se você estiver acessando pelo Vercel, certifique-se de que o domínio da sua app está listado em "Authorized Domains" no Console do Firebase.
              </div>
            )}
            <button 
              onClick={handleLogin}
              className="w-full bg-white border border-slate-200 hover:border-indigo-300 py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-700 shadow-sm transition-all active:scale-[0.98] group"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Continuar com Google
            </button>
            
            <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
              Ao entrar, você concorda com nossos termos.
            </p>
          </div>
      </main>
      
      {/* Aesthetic Footer Detail */}
      <footer className="p-8 text-center">
        <div className="flex justify-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
        </div>
      </footer>
    </div>
  );
};

const FeatureItem: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="flex gap-4 p-4 bg-white/50 backdrop-blur-sm border border-white rounded-2xl">
    <div className="shrink-0 mt-1">{icon}</div>
    <div className="space-y-0.5">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default LoginScreen;
