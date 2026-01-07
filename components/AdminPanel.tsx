
import React, { useState, useEffect } from 'react';
import { AuthData, Vendedor, ApiResponse } from '../types';

interface Props {
  auth: AuthData;
  onLogout: () => void;
}

import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

export default function AdminPanel({ auth, onLogout }: Props) {
  const [activeSection, setActiveSection] = useState<'DASHBOARD' | 'VENDEDORES' | 'REGISTRO_VENTA'>('DASHBOARD');
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [newVendedor, setNewVendedor] = useState({
    nombre: '', 
    ci: '', 
    tienda: '', 
    ciudad: '', 
    email: '', 
    password: '', 
    rolNombre: 'VENDEDOR'
  });

  const getHeaders = () => ({
    'Authorization': `Bearer ${auth.token}`,
    'Accept': '*/*',
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    if (activeSection === 'VENDEDORES' && auth.rol === 'ADMIN') {
      fetchVendedores();
    }
  }, [activeSection]);

  const fetchVendedores = async () => {
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VENDORS_LIST}`, {
        headers: getHeaders()
      });
      
      if (!res.ok) throw new Error(`Error ${res.status}: No se pudo obtener la lista.`);
      
      const result: ApiResponse<Vendedor[]> = await res.json();
      if (!result.error) {
        setVendedores(result.data || []);
      } else {
        setStatusMsg({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      console.error("Error fetching sellers:", err);
      setStatusMsg({ type: 'error', text: err.message || 'Error de conexión con la API.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VENDOR_CREATE}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newVendedor)
      });
      
      const result: ApiResponse<any> = await res.json();
      if (!result.error) {
        setStatusMsg({ type: 'success', text: '¡Vendedor fichado con éxito!' });
        setShowModal(false);
        fetchVendedores();
        setNewVendedor({ nombre: '', ci: '', tienda: '', ciudad: '', email: '', password: '', rolNombre: 'VENDEDOR' });
      } else {
        setStatusMsg({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Error al procesar el registro del vendedor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("¿Dar de baja definitiva a este vendedor del sistema Skyworth?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VENDOR_DEACTIVATE(id)}`, {
        method: 'PUT',
        headers: getHeaders()
      });
      
      const result: ApiResponse<any> = await res.json();
      if (!result.error) {
        setStatusMsg({ type: 'success', text: 'Vendedor desactivado del plantel.' });
        fetchVendedores();
      } else {
        setStatusMsg({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Error al conectar con la API de desactivación.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-80 bg-skyworth-dark text-white flex flex-col fixed h-full z-20 shadow-2xl border-r-4 border-skyworth-accent">
        <div className="p-10 border-b border-white/10 text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-skyworth-blue to-skyworth-light rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-white shadow-xl">
               {auth.rol === 'ADMIN' ? '👨‍✈️' : '🏃‍♂️'}
            </div>
            <h3 className="font-sport text-3xl tracking-widest leading-none truncate">{auth.nombre}</h3>
            <div className="mt-3 inline-block px-4 py-1 bg-skyworth-accent text-skyworth-dark rounded-full text-[10px] font-black uppercase tracking-widest">
                {auth.rol === 'ADMIN' ? 'DT / ADMINISTRADOR' : 'JUGADOR / VENDEDOR'}
            </div>
        </div>
        
        <nav className="flex-1 py-10 px-6 space-y-3">
          <button onClick={() => setActiveSection('DASHBOARD')} className={`w-full text-left p-5 rounded-2xl transition flex items-center gap-4 font-bold ${activeSection === 'DASHBOARD' ? 'bg-skyworth-blue text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-white/5'}`}>
            <span>📊</span> <span className="uppercase tracking-widest text-xs">Marcador Global</span>
          </button>
          {auth.rol === 'ADMIN' && (
            <button onClick={() => setActiveSection('VENDEDORES')} className={`w-full text-left p-5 rounded-2xl transition flex items-center gap-4 font-bold ${activeSection === 'VENDEDORES' ? 'bg-skyworth-blue text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-white/5'}`}>
                <span>👥</span> <span className="uppercase tracking-widest text-xs">Cuerpo Técnico</span>
            </button>
          )}
          <button onClick={() => setActiveSection('REGISTRO_VENTA')} className={`w-full text-left p-5 rounded-2xl transition flex items-center gap-4 font-bold ${activeSection === 'REGISTRO_VENTA' ? 'bg-skyworth-blue text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-white/5'}`}>
            <span>🎟️</span> <span className="uppercase tracking-widest text-xs">Anotar Venta</span>
          </button>
        </nav>

        <div className="p-8">
          <button onClick={onLogout} className="w-full py-4 bg-red-600/10 border-2 border-red-600/50 hover:bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition shadow-lg active:scale-95">
             Abandonar Campo
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-80 p-16">
        <header className="flex justify-between items-end mb-16 border-b-4 border-gray-100 pb-10">
            <div>
                <h1 className="text-7xl font-sport text-skyworth-dark leading-none">
                    {activeSection === 'DASHBOARD' ? 'TABLERO DE CONTROL' : 
                     activeSection === 'VENDEDORES' ? 'ADMIN STAFF' : 'NUEVO FICHAJE'}
                </h1>
                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Sistema Oficial Skyworth Mundial 2025</p>
            </div>
            <div className="bg-white px-8 py-4 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full animate-pulse ${statusMsg.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Conexión VAR Activa</span>
            </div>
        </header>

        {statusMsg.text && (
            <div className={`mb-10 p-6 rounded-3xl font-bold flex items-center justify-between gap-4 animate-fade-in ${statusMsg.type === 'success' ? 'bg-green-100 text-green-800 border-l-8 border-green-500' : 'bg-red-100 text-red-800 border-l-8 border-red-500'}`}>
                <div className="flex items-center gap-4">
                  <span>{statusMsg.type === 'success' ? '✅' : '🚫'}</span> {statusMsg.text}
                </div>
                <button onClick={() => setStatusMsg({type:'', text:''})} className="opacity-40 hover:opacity-100">&times;</button>
            </div>
        )}

        {activeSection === 'DASHBOARD' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-in">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border-t-[10px] border-skyworth-blue">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Premios Clientes</p>
                    <h4 className="text-6xl font-sport text-skyworth-dark mt-4">5 ENTRADAS</h4>
                </div>
                <div className="bg-skyworth-dark p-12 rounded-[3rem] shadow-xl border-t-[10px] border-skyworth-accent text-white">
                    <p className="text-[10px] font-black text-skyworth-accent uppercase tracking-widest">Premios Vendedores</p>
                    <h4 className="text-6xl font-sport text-white mt-4">6 ENTRADAS</h4>
                </div>
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border-t-[10px] border-skyworth-grass">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado Campaña</p>
                    <h4 className="text-4xl font-sport text-skyworth-pitch mt-4">NUEVO FICHAJE</h4>
                </div>
            </div>
        )}

        {activeSection === 'VENDEDORES' && auth.rol === 'ADMIN' && (
            <div className="animate-fade-in space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-sport text-skyworth-dark">LISTADO DE CUERPO TÉCNICO</h2>
                    <button onClick={() => setShowModal(true)} className="bg-skyworth-blue text-white px-10 py-4 rounded-2xl font-sport text-2xl shadow-xl hover:bg-skyworth-light transition transform active:scale-95">
                        + FICHAR VENDEDOR
                    </button>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Titular / CI</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tienda / Ciudad</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !vendedores.length ? (
                                <tr><td colSpan={5} className="p-20 text-center text-gray-300 font-sport text-3xl animate-pulse">SINCRONIZANDO CON EL VAR...</td></tr>
                            ) : vendedores.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-gray-300 font-bold uppercase">No hay vendedores registrados.</td></tr>
                            ) : vendedores.map(v => (
                                <tr key={v.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-8">
                                        <p className="font-bold text-skyworth-dark text-lg">{v.nombre}</p>
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">CI: {v.ci}</p>
                                    </td>
                                    <td className="p-8">
                                        <p className="text-sm font-bold">{v.tienda}</p>
                                        <p className="text-[10px] text-skyworth-blue font-black uppercase tracking-widest">{v.ciudad}</p>
                                    </td>
                                    <td className="p-8 text-sm font-medium text-gray-600">{v.email}</td>
                                    <td className="p-8">
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${v.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {v.activo ? '● TITULAR' : '○ EXPULSADO'}
                                        </span>
                                    </td>
                                    <td className="p-8 text-right">
                                        {v.activo && (
                                            <button onClick={() => handleDeactivate(v.id)} className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest border-2 border-red-50 px-4 py-2 rounded-xl transition shadow-sm">
                                                Dar de baja
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeSection === 'REGISTRO_VENTA' && (
            <div className="animate-fade-in max-w-3xl mx-auto">
                <div className="bg-white p-16 rounded-[4rem] shadow-2xl border-t-[16px] border-skyworth-accent text-center">
                    <span className="text-7xl block mb-8 animate-bounce">🎟️</span>
                    <h2 className="text-6xl font-sport text-skyworth-dark leading-none">ANOTAR NUEVA VENTA</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-6 mb-12">Cada venta te otorga +1 cupón para el sorteo de staff</p>
                    <form className="space-y-10 text-left" onSubmit={e => {e.preventDefault(); alert("Enviando registro de venta...");}}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <label className="text-[10px] font-black text-skyworth-blue uppercase tracking-widest mb-3 block">Serial del Equipo (Dorsal)</label>
                                <input required className="w-full p-6 border-2 border-gray-100 rounded-[2rem] font-mono text-2xl uppercase text-skyworth-dark font-black outline-none bg-gray-50/50 focus:border-skyworth-accent focus:bg-white shadow-inner transition-all" placeholder="SKY-XXXXXXXX" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-skyworth-blue uppercase tracking-widest mb-3 block">Número Factura</label>
                                <input required className="w-full p-6 border-2 border-gray-100 rounded-[2rem] font-bold text-xl outline-none bg-gray-50/50 focus:border-skyworth-accent focus:bg-white shadow-inner transition-all" placeholder="FACT-000123" />
                            </div>
                        </div>
                        <div className="p-12 bg-gradient-to-r from-skyworth-blue to-skyworth-dark rounded-[3rem] text-center text-white border-b-[10px] border-skyworth-accent shadow-2xl">
                            <p className="text-[11px] font-black text-skyworth-accent uppercase tracking-widest mb-2">Recompensa para el Vendedor</p>
                            <h5 className="font-sport text-4xl">¡GANARÁS +1 CUPÓN PERSONAL!</h5>
                        </div>
                        <button type="submit" className="w-full py-8 bg-skyworth-blue text-white font-sport text-6xl rounded-[2.5rem] shadow-xl hover:bg-skyworth-light transition transform active:scale-95 border-b-[12px] border-blue-900 active:border-b-0 active:translate-y-3">
                            CONFIRMAR FICHAJE
                        </button>
                    </form>
                </div>
            </div>
        )}

        {showModal && (
            <div className="fixed inset-0 z-[100] bg-skyworth-dark/95 backdrop-blur-xl flex items-center justify-center p-8 overflow-y-auto">
                <div className="bg-white rounded-[4rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-fade-in border-t-[20px] border-skyworth-blue my-auto">
                    <div className="p-12 bg-gray-50 flex justify-between items-center border-b border-gray-100">
                        <h3 className="text-6xl font-sport text-skyworth-dark leading-none">FICHAR NUEVO VENDEDOR</h3>
                        <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-red-500 text-6xl font-light">&times;</button>
                    </div>
                    <form onSubmit={handleCreateVendedor} className="p-16 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nombre Completo</label>
                                    <input required value={newVendedor.nombre} onChange={e => setNewVendedor({...newVendedor, nombre: e.target.value})} className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-skyworth-blue outline-none font-bold bg-white" placeholder="Ej: Juan Pérez" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">CI / Documento</label>
                                    <input required value={newVendedor.ci} onChange={e => setNewVendedor({...newVendedor, ci: e.target.value})} className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-skyworth-blue outline-none font-bold bg-white" placeholder="12345678" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Ciudad</label>
                                    <input required value={newVendedor.ciudad} onChange={e => setNewVendedor({...newVendedor, ciudad: e.target.value})} className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-skyworth-blue outline-none font-bold bg-white" placeholder="Santa Cruz" />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tienda de Venta</label>
                                    <input required value={newVendedor.tienda} onChange={e => setNewVendedor({...newVendedor, tienda: e.target.value})} className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-skyworth-blue outline-none font-bold bg-white" placeholder="Sucursal Centro" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Correo Corporativo</label>
                                    <input required type="email" value={newVendedor.email} onChange={e => setNewVendedor({...newVendedor, email: e.target.value})} className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-skyworth-blue outline-none font-bold bg-white" placeholder="juan@skyworth.com" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Contraseña Inicial</label>
                                    <input required type="password" value={newVendedor.password} onChange={e => setNewVendedor({...newVendedor, password: e.target.value})} className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-skyworth-blue outline-none font-bold bg-white" placeholder="••••••••" />
                                </div>
                            </div>
                        </div>
                        <button disabled={loading} type="submit" className="w-full py-10 bg-gradient-to-r from-skyworth-grass to-skyworth-pitch text-white font-sport text-5xl rounded-[2.5rem] shadow-2xl hover:brightness-110 transition transform active:scale-95 disabled:opacity-50 border-b-[10px] border-green-900 active:border-b-0 active:translate-y-3">
                            {loading ? 'FICHANDO JUGADOR...' : '¡CONFIRMAR REGISTRO OFICIAL!'}
                        </button>
                    </form>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
