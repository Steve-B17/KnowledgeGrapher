import React, { useContext, useState } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Network } from 'lucide-react';

function AppContent() {
  const { token, loading } = useContext(AuthContext);
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Network className="w-10 h-10 text-violet-500 animate-pulse" />
        <span className="text-sm font-semibold text-slate-400 tracking-wider uppercase">
          Loading KnowledgeGrapher…
        </span>
      </div>
    );
  }

  if (token) return <Dashboard />;

  return showRegister
    ? <Register onToggleAuth={() => setShowRegister(false)} />
    : <Login onToggleAuth={() => setShowRegister(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
