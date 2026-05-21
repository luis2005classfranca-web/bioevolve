import { signInWithGoogle } from '../lib/firebase';

export function LoginScreen() {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">BioEvolve</h1>
      <button 
        onClick={handleLogin}
        className="bg-white border text-slate-800 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition shadow-sm"
      >
        Entrar com Google
      </button>
    </div>
  );
}
