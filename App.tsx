import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PublicLanding from './components/PublicLanding';

const StadiumLoader = () => (
  <div className="h-screen w-full bg-skyworth-dark flex flex-col items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#005BBB_0%,_#001A3D_100%)]"></div>
    <div className="relative z-10 flex flex-col items-center">
        <div className="text-6xl animate-bounce mb-4">⚽</div>
        <h2 className="text-3xl font-sport text-white tracking-widest mb-2">SKYWORTH</h2>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-skyworth-accent rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-skyworth-accent rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-skyworth-accent rounded-full animate-pulse delay-150"></div>
        </div>
        <p className="text-skyworth-accent text-[10px] mt-4 font-mono uppercase tracking-widest opacity-80 font-bold">Iniciando Transmisión...</p>
    </div>
  </div>
);

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<'registro' | 'dashboard'>('registro');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <StadiumLoader />;

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Si está autenticado, mostrar dashboard o registro sin header
  return currentPage === 'dashboard' ? (
    <Dashboard onNavigateToRegistro={() => setCurrentPage('registro')} />
  ) : (
    <PublicLanding onNavigateToDashboard={() => setCurrentPage('dashboard')} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
