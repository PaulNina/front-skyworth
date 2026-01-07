
import React, { useState } from 'react';
import { ApiResponse, AuthData } from '../types';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface Props {
  onLoginSuccess: (auth: AuthData) => void;
}

export default function AdminLogin({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isHttps = window.location.protocol === 'https:';
    const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `Error del servidor: ${response.status}`);
        } catch {
          throw new Error(`Error del servidor (${response.status}): ${errorText || 'Sin respuesta'}`);
        }
      }

      const result: ApiResponse<AuthData> = await response.json();

      if (!result.error) {
        localStorage.setItem('sky_auth', JSON.stringify(result.data));
        onLoginSuccess(result.data);
      } else {
        setError(result.message || 'Credenciales inválidas');
      }
    } catch (err: any) {
      console.error("Login Error Details:", err);
      
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        if (isHttps && !API_BASE_URL.startsWith('https')) {
          setError('⚠️ ERROR DE SEGURIDAD (Mixed Content): El navegador bloquea la conexión porque este sitio es HTTPS y la API es HTTP. Asegúrate de configurar la API_URL con HTTPS.');
        } else {
          setError(`⚠️ ERROR DE RED: No se pudo establecer conexión con el servidor (${API_BASE_URL}). Verifique que el servidor tenga CORS habilitado.`);
        }
      } else {
        setError(err.message || 'Error desconocido al intentar iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stadium-gradient flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-pattern-soccer opacity-10"></div>
      
      <div className="bg-white rounded-[3rem] shadow-2xl p-12 max-w-md w-full relative z-10 border-t-[12px] border-skyworth-accent animate-fade-in">
        <div className="text-center mb-10">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-5xl font-sport text-skyworth-dark uppercase tracking-widest leading-none">
              ZONA TÉCNICA
            </h2>
            <p className="text-[10px] text-gray-400 font-black tracking-[0.3em] uppercase mt-4 italic">Acceso Administrativo Skyworth</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-8 border-red-500 text-red-700 p-6 rounded-2xl mb-8 text-xs font-bold leading-relaxed shadow-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="group">
            <label className="block text-[10px] font-black text-skyworth-blue mb-2 uppercase tracking-widest group-focus-within:text-skyworth-accent transition-colors">Usuario (Email)</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-skyworth-accent outline-none transition font-bold text-gray-700 bg-gray-50/50"
              placeholder="admin@skyworth.com"
              required
            />
          </div>
          <div className="group">
            <label className="block text-[10px] font-black text-skyworth-blue mb-2 uppercase tracking-widest group-focus-within:text-skyworth-accent transition-colors">Clave de Acceso</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-skyworth-accent outline-none transition font-bold text-gray-700 bg-gray-50/50"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-skyworth-blue text-white py-6 rounded-2xl font-sport text-4xl hover:bg-skyworth-dark transition-all disabled:opacity-50 shadow-2xl tracking-widest transform active:scale-95 border-b-[8px] border-blue-900 active:border-b-0 active:translate-y-2"
          >
            {loading ? 'SOLICITANDO VAR...' : 'INGRESAR AL SISTEMA'}
          </button>
        </form>

        <button onClick={() => window.location.hash = ''} className="w-full mt-10 text-gray-400 text-[10px] hover:text-skyworth-blue font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
          <span>←</span> VOLVER AL PORTAL PÚBLICO
        </button>
      </div>
    </div>
  );
}
