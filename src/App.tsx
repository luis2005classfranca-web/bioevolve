/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { LoginScreen } from './components/LoginScreen';
import { HealthScan } from './components/HealthScan/HealthScan';
import { Timeline } from './components/Timeline/Timeline';
import { auth } from './lib/firebase';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');

  if (loading) return <div>Loading...</div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between">
        <span className="font-bold text-xl tracking-tight">BioEvolve</span>
        <button onClick={() => auth.signOut()} className="text-sm text-slate-500 font-semibold hover:text-slate-800 transition-colors">SAIR</button>
      </header>
      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === 'scan' ? <HealthScan /> : <Timeline />}
      </main>
      <nav className="bg-white border-t border-slate-200 flex">
        <button 
          className={`flex-1 p-4 font-semibold transition-colors ${activeTab === 'scan' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('scan')}
        >
          Novo Scan
        </button>
        <button 
          className={`flex-1 p-4 font-semibold transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('history')}
        >
          Histórico
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
