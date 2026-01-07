import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

interface Configuracion {
  id: number;
  clave: string;
  valor: string;
  descripcion: string;
  categoria: string;
  requiereReinicio: boolean;
}

interface ConfigPorCategoria {
  [categoria: string]: Configuracion[];
}

export default function ConfiguracionPage() {
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [configPorCategoria, setConfigPorCategoria] = useState<ConfigPorCategoria>({});
  const [loading, setLoading] = useState(true);
  const [editandoClave, setEditandoClave] = useState<string | null>(null);
  const [nuevoValor, setNuevoValor] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);

  const categorias = ['WHATSAPP', 'GEMINI', 'EMAIL', 'JWT', 'SERVER'];

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CONFIG_LIST}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setConfiguraciones(data.data || []);
        agruparPorCategoria(data.data || []);
      }
    } catch (err) {
      console.error('Error cargando configuraciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const agruparPorCategoria = (configs: Configuracion[]) => {
    const agrupadas: ConfigPorCategoria = {};
    configs.forEach((config) => {
      if (!agrupadas[config.categoria]) {
        agrupadas[config.categoria] = [];
      }
      agrupadas[config.categoria].push(config);
    });
    setConfigPorCategoria(agrupadas);
  };

  const iniciarEdicion = (config: Configuracion) => {
    setEditandoClave(config.clave);
    setNuevoValor(config.valor);
    setError('');
    setSuccess('');
  };

  const cancelarEdicion = () => {
    setEditandoClave(null);
    setNuevoValor('');
  };

  const guardarConfiguracion = async () => {
    if (!editandoClave) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CONFIG_UPDATE(editandoClave)}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ valor: nuevoValor }),
        }
      );

      const data = await response.json();

      if (response.ok && !data.error) {
        setSuccess(data.mensaje || 'Configuración actualizada correctamente');
        setEditandoClave(null);
        setNuevoValor('');
        cargarConfiguraciones();

        // Auto-probar WhatsApp si se editó una config de WhatsApp
        if (editandoClave.includes('whatsapp')) {
          setTimeout(() => probarWhatsApp(), 500);
        }
      } else {
        setError(data.mensaje || 'Error al actualizar configuración');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    }
  };

  const probarWhatsApp = async () => {
    setTestingWhatsApp(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CONFIG_TEST_WHATSAPP}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        if (data.data?.habilitado) {
          setSuccess('✅ WhatsApp configurado correctamente');
        } else {
          setError(data.data?.mensaje || 'WhatsApp no está habilitado');
        }
      } else {
        setError(data.mensaje || 'Error al probar WhatsApp');
      }
    } catch (err: any) {
      setError('Error de conexión al probar WhatsApp');
    } finally {
      setTestingWhatsApp(false);
    }
  };

  const refrescarCache = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CONFIG_REFRESH_CACHE}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        setSuccess('✅ Cache refrescado exitosamente');
        cargarConfiguraciones();
      } else {
        setError(data.mensaje || 'Error al refrescar cache');
      }
    } catch (err) {
      setError('Error al refrescar cache');
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    const icons: { [key: string]: string } = {
      WHATSAPP: '💬',
      GEMINI: '🤖',
      EMAIL: '📧',
      JWT: '🔐',
      SERVER: '⚙️',
    };
    return icons[categoria] || '📋';
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      WHATSAPP: 'border-green-500',
      GEMINI: 'border-purple-500',
      EMAIL: 'border-blue-500',
      JWT: 'border-yellow-500',
      SERVER: 'border-gray-500',
    };
    return colors[categoria] || 'border-gray-400';
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-sport text-skyworth-dark mb-2">CONFIGURACIÓN DEL SISTEMA</h2>
          <p className="text-sm text-gray-500">Gestiona los parámetros de la aplicación</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={probarWhatsApp}
            disabled={testingWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span>{testingWhatsApp ? '⏳' : '💬'}</span>
            {testingWhatsApp ? 'Probando...' : 'Probar WhatsApp'}
          </button>

          <button
            onClick={refrescarCache}
            className="bg-skyworth-blue hover:bg-skyworth-dark text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
          >
            <span>🔄</span>
            Refrescar Cache
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg">
          <p className="text-green-800 font-bold text-sm flex items-center gap-2">
            <span>✅</span> {success}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-red-800 font-bold text-sm flex items-center gap-2">
            <span>❌</span> {error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-4xl mb-3">⚽</div>
          <p className="text-gray-500 font-bold">Cargando configuraciones...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categorias.map((categoria) =>
            configPorCategoria[categoria] ? (
              <div
                key={categoria}
                className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${getCategoriaColor(categoria)}`}
              >
                <h3 className="text-xl font-sport text-skyworth-dark mb-4 flex items-center gap-2">
                  <span className="text-2xl">{getCategoriaIcon(categoria)}</span>
                  {categoria}
                </h3>

                <div className="space-y-4">
                  {configPorCategoria[categoria].map((config) => (
                    <div
                      key={config.id}
                      className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-sm text-skyworth-blue">
                              {config.clave}
                            </span>
                            {config.requiereReinicio && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                                ⚠️ Requiere Reinicio
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{config.descripcion}</p>
                        </div>

                        {editandoClave === config.clave ? (
                          <div className="flex gap-2">
                            <button
                              onClick={guardarConfiguracion}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-bold"
                            >
                              ✓ Guardar
                            </button>
                            <button
                              onClick={cancelarEdicion}
                              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
                            >
                              ✕ Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => iniciarEdicion(config)}
                            className="bg-skyworth-blue hover:bg-skyworth-dark text-white px-3 py-1 rounded-lg text-xs font-bold"
                          >
                            ✏️ Editar
                          </button>
                        )}
                      </div>

                      {editandoClave === config.clave ? (
                        <input
                          type="text"
                          value={nuevoValor}
                          onChange={(e) => setNuevoValor(e.target.value)}
                          className="w-full p-2 border-2 border-skyworth-grass rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-skyworth-accent"
                          autoFocus
                        />
                      ) : (
                        <div className="bg-gray-100 rounded-lg p-2 font-mono text-sm text-gray-800 break-all">
                          {config.valor || '(vacío)'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
