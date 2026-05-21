import { signInWithGoogle } from '../lib/firebase';
import { Activity, ShieldCheck, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background soft ambient lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-100/40 to-violet-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-teal-50/30 to-blue-100/30 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      {/* Top Header/Brand Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">Bio<span className="text-indigo-600">Evolve</span></span>
            <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-1">A.I. Health Intelligence</span>
          </div>
        </div>
        
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/70">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
          Versão Digital Beta
        </span>
      </header>

      {/* Main hero and login layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center justify-center my-8">
        
        {/* Left column: Key value propositions */}
        <div className="lg:col-span-7 space-y-8 text-left max-w-2xl lg:max-w-none">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-indigo-700 border border-slate-100 shadow-sm">
              <Sparkles size={14} className="text-amber-400 fill-amber-400" />
              Sua saúde traduzida por Inteligência Artificial
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
              Transforme seus exames de laboratório em <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">dados inteligentes</span>
            </h1>
            
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-xl">
              Esqueça tabelas indecrifráveis e nomes médicos em latim. O BioEvolve une IA e curvas evolutivas para dar clareza absoluta ao seu histórico de exames.
            </p>
          </div>

          {/* Quick value props list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-3.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mt-0.5">
                <Sparkles size={18} className="fill-indigo-100" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Leitura com IA Integrada</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">Extração instantânea e direta das métricas vitais a partir de fotos ou PDFs.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-3.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Tendências do Seu Histórico</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">Acompanhe se seus biomarcadores estão em queda, estáveis ou sob atenção.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Login card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-xl shadow-slate-200/40 relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Heart size={120} className="text-indigo-600" />
            </div>

            <div className="relative z-10 text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Comece sua evolução</h2>
                <p className="text-slate-400 text-sm">Acesse o portal do paciente de forma rápida, segura e sem senhas complicadas.</p>
              </div>

              {/* Enhanced Google Login Button */}
              <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-semibold hover:bg-slate-50 transition-all shadow-sm hover:border-slate-300 drop-shadow-xs active:scale-98 cursor-pointer disabled:opacity-50 text-sm relative overflow-hidden"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {/* Official standard Google color logo */}
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-2.6-2.81-4.54-5.84-4.54z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>Entrar de forma segura com o Google</span>
                  </>
                )}
              </button>

              {/* Data Safety Notice */}
              <div className="pt-2 flex items-center justify-center gap-2 text-slate-400 text-xs">
                <ShieldCheck size={14} className="text-indigo-500 flex-shrink-0" />
                <span>Dados de exames criptografados e privados</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          <p>© 2026 BioEvolve. Desenvolvido para empoderamento informativo de saúde.</p>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-600 transition-colors">Termos de Uso</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-600 transition-colors">Regras de Privacidade</a>
        </div>
      </footer>
    </div>
  );
}

