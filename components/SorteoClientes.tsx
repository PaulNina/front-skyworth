import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

interface GanadorCliente {
  codigoCupon: string;
  nombreCliente: string;
  ciCliente: string;
  posicion: number;
  fechaSorteo?: string;
}

export default function SorteoClientes() {
  const [ganadores, setGanadores] = useState<GanadorCliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [sorteando, setSorteando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGanadores();
  }, []);

  const fetchGanadores = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SORTEO_CLIENTES_GANADORES}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setGanadores(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching ganadores:', err);
    } finally {
      setLoading(false);
    }
  };

  const realizarSorteo = async () => {
    setSorteando(true);
    setError('');
    setMensaje('');

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SORTEO_CLIENTES_REALIZAR}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        setMensaje(data.message);
        setTimeout(() => {
          fetchGanadores();
        }, 1000);
      } else {
        setError(data.message || 'Error al realizar sorteo');
      }
    } catch (err: any) {
      setError(err.message || 'Error al realizar sorteo');
    } finally {
      setSorteando(false);
    }
  };

  const sorteoCompleto = ganadores.length >= 5;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-sport text-skyworth-dark mb-2">LA GRAN FINAL</h2>
        <p className="text-sm text-gray-500">Sorteo de cupones para clientes - 5 ganadores</p>
      </div>

      {/* Sorteo Card */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-4 border-yellow-400 rounded-3xl shadow-2xl p-12">
          <div className="text-center">
            <div className="text-8xl mb-6 animate-bounce">🏆</div>
            <h3 className="text-4xl font-sport text-skyworth-dark mb-4">LA GRAN FINAL</h3>
            <p className="text-lg text-gray-700 mb-8 font-bold">Sistema de Sorteo Certificado</p>
            
            {mensaje && (
              <div className="mb-6 bg-green-100 border-2 border-green-500 rounded-xl p-4">
                <p className="text-green-800 font-bold">{mensaje}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-100 border-2 border-red-500 rounded-xl p-4">
                <p className="text-red-800 font-bold">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-2xl font-black text-skyworth-dark">
                {ganadores.length} / 5 Ganadores
              </p>
              {sorteoCompleto && (
                <p className="text-green-600 font-bold mt-2">✅ Sorteo Completado</p>
              )}
            </div>

            <button
              onClick={realizarSorteo}
              disabled={sorteando || sorteoCompleto}
              className={`px-12 py-4 rounded-full text-xl font-black uppercase tracking-wider transition-all transform hover:scale-105 ${
                sorteoCompleto
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-skyworth-dark shadow-lg'
              }`}
            >
              {sorteando ? '⏳ Sorteando...' : sorteoCompleto ? '✅ Sorteo Completo' : '🎲 Iniciar Sorteo'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Ganadores */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-skyworth-dark text-white p-6">
          <h3 className="text-2xl font-sport">🏆 GANADORES DEL SORTEO</h3>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl mb-3">⚽</div>
            <p className="text-gray-500 font-bold">Cargando ganadores...</p>
          </div>
        ) : ganadores.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎟️</div>
            <p className="text-gray-500 font-bold">Aún no hay ganadores</p>
            <p className="text-sm text-gray-400 mt-2">Presiona "INICIAR SORTEO" para seleccionar al primer ganador</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-gray-700">Posición</th>
                  <th className="text-left py-4 px-6 font-bold text-sm uppercase tracking-wider text-gray-700">Código Cupón</th>
                  <th className="text-left py-4 px-6 font-bold text-sm uppercase tracking-wider text-gray-700">Ganador</th>
                  <th className="text-left py-4 px-6 font-bold text-sm uppercase tracking-wider text-gray-700">CI</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider text-gray-700">Fecha Sorteo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ganadores.map((ganador, index) => (
                  <tr key={index} className="hover:bg-yellow-50 transition-colors">
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-black text-lg">
                        {ganador.posicion}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-skyworth-blue text-lg">
                        {ganador.codigoCupon}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-lg text-gray-800">{ganador.nombreCliente}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600">{ganador.ciCliente}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-sm text-gray-500">
                        {ganador.fechaSorteo ? new Date(ganador.fechaSorteo).toLocaleString('es-BO') : new Date().toLocaleString('es-BO')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
