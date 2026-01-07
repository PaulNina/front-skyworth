import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Navigation will be handled by App.tsx
    } catch (err: any) {
      setError(err.message || 'Error en el inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stadium-gradient flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-pattern-soccer opacity-10"></div>
      
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full border-t-8 border-skyworth-accent">
        <div className="text-center mb-8">
          <div className="text-5xl md:text-6xl mb-4">⚽</div>
          <h2 className="text-3xl md:text-4xl font-sport text-skyworth-dark leading-none">
            ACCESO VENDEDOR
          </h2>
          <div className="w-20 h-1.5 bg-skyworth-accent mx-auto rounded-full mt-3"></div>
          <p className="text-gray-400 font-black text-xs tracking-wider mt-3 uppercase">
            Skyworth Bolivia 2026
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-900 font-bold rounded-xl mb-6 text-sm flex items-center gap-3">
            <span className="text-2xl">🚫</span>
            <div>
              <p className="font-black uppercase text-xs opacity-50 mb-1">Error</p>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="text-xs font-black text-skyworth-blue uppercase tracking-wide absolute -top-2.5 left-4 bg-white px-3 z-10">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-skyworth-grass outline-none transition-all bg-gray-50/50 font-bold text-gray-800 text-sm shadow-inner focus:bg-white"
              placeholder="vendedor@skyworth.com"
            />
          </div>

          <div className="relative">
            <label className="text-xs font-black text-skyworth-blue uppercase tracking-wide absolute -top-2.5 left-4 bg-white px-3 z-10">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-skyworth-grass outline-none transition-all bg-gray-50/50 font-bold text-gray-800 text-sm shadow-inner focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-sport text-xl tracking-wide shadow-lg transform transition-all border-b-4 active:border-b-0 active:translate-y-2 ${
              loading
                ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-skyworth-grass to-skyworth-pitch border-green-900 hover:brightness-110 hover:scale-105'
            }`}
          >
            {loading ? '⏳ VERIFICANDO...' : '🔐 INICIAR SESIÓN'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            ¿Problemas para acceder?{' '}
            <a href="mailto:admin@skyworth.com" className="text-skyworth-blue font-bold underline">
              Contactar Administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
