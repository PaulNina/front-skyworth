import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import SerialsManagement from './SerialsManagement';
import ConfiguracionPage from './ConfiguracionPage';
import PlayersManagement from './PlayersManagement';
import SorteoPage from './SorteoPage';
import VendorRegistration from './VendorRegistration';
import DashboardContent from './DashboardContent';

interface DashboardResumen {
  jugadoresInscritos: number;
  seriesCanjeadas: number;
  serialesDisponibles: number;
}

interface ModeloEstrella {
  nombreVendedor: string;
  tienda: string;
  ciudad: string;
  cantidadVentas: number;
}

interface MapaCalor {
  departamento: string;
  cantidadVentas: number;
}

interface RitmoJuego {
  fecha: string;
  cantidad: number;
}

interface DashboardProps {
  onNavigateToRegistro?: () => void;
}

export default function Dashboard({ onNavigateToRegistro }: DashboardProps) {
  const { user, logout } = useAuth();
  const [resumen, setResumen] = useState<DashboardResumen>({
    jugadoresInscritos: 0,
    seriesCanjeadas: 0,
    serialesDisponibles: 0,
  });
  const [modelosEstrella, setModelosEstrella] = useState<ModeloEstrella[]>([]);
  const [mapaCalor, setMapaCalor] = useState<MapaCalor[]>([]);
  const [ritmoJuego, setRitmoJuego] = useState<RitmoJuego[]>([]);
  const [diasRitmo, setDiasRitmo] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('tablero');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeSection === 'tablero') {
      fetchRitmoJuego();
    }
  }, [diasRitmo, activeSection]);

  const fetchRitmoJuego = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DASHBOARD_RITMO_JUEGO(diasRitmo)}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setRitmoJuego(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching ritmo juego:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch resumen
      const resumenRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DASHBOARD_RESUMEN}`, {
        headers: getAuthHeaders(),
      });
      if (resumenRes.ok) {
        const data = await resumenRes.json();
        setResumen(data.data);
      }

      // Fetch modelos estrella
      const modelosRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DASHBOARD_MODELOS_ESTRELLA(10)}`, {
        headers: getAuthHeaders(),
      });
      if (modelosRes.ok) {
        const data = await modelosRes.json();
        setModelosEstrella(data.data || []);
      }

      // Fetch mapa de calor
      const mapaRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DASHBOARD_MAPA_CALOR}`, {
        headers: getAuthHeaders(),
      });
      if (mapaRes.ok) {
        const data = await mapaRes.json();
        setMapaCalor(data.data || []);
      }

      // Fetch ritmo de juego
      await fetchRitmoJuego();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'tablero', icon: '📊', label: 'Tablero', roles: ['ADMIN', 'VENDEDOR'] },
    { id: 'seriales', icon: '🔢', label: 'Seriales', roles: ['ADMIN'] },
    { id: 'registro', icon: '📝', label: 'Registro Vendedores', roles: ['ADMIN'] },
    { id: 'jugadores', icon: '👥', label: 'Jugadores', roles: ['ADMIN'] },
    { id: 'ajustes', icon: '⚙️', label: 'Ajustes', roles: ['ADMIN'] },
    { id: 'sorteo', icon: '🏆', label: 'Copa (Sorteo)', roles: ['ADMIN'] },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.rol || '')
  );

  // Render different sections based on activeSection
  const renderContent = () => {
    if (activeSection === 'seriales') {
      return <SerialsManagement />;
    }

    if (activeSection === 'ajustes') {
      return <ConfiguracionPage />;
    }

    if (activeSection === 'jugadores') {
      return <PlayersManagement />;
    }

    if (activeSection === 'sorteo') {
      return <SorteoPage />;
    }

    if (activeSection === 'registro') {
      return <VendorRegistration />;
    }

    // Default: Tablero (Dashboard)
    return (
      <DashboardContent
        resumen={resumen}
        modelosEstrella={modelosEstrella}
        mapaCalor={mapaCalor}
        ritmoJuego={ritmoJuego}
        diasRitmo={diasRitmo}
        onChangeDiasRitmo={setDiasRitmo}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-skyworth-dark to-blue-950 text-white shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚡</span>
            <h1 className="text-2xl font-sport tracking-wider">ZONA DT</h1>
          </div>
          <p className="text-xs text-gray-400">SKYWORTH BOLIVIA</p>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {/* Botón de Registro - siempre visible arriba */}
          <button
            onClick={onNavigateToRegistro}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg"
          >
            <span className="text-xl">📝</span>
            <span className="text-sm">Registro</span>
          </button>

          <div className="h-px bg-white/10 my-2"></div>

          {visibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === item.id
                  ? 'bg-skyworth-accent text-skyworth-dark font-bold shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User info and logout at bottom */}
        <div className="border-t border-white/10">
          <div className="p-4 border-b border-white/10">
            <p className="text-sm text-white font-bold">{user?.nombre}</p>
            <p className="text-xs text-skyworth-accent uppercase tracking-wide">{user?.rol}</p>
          </div>
          
          <div className="p-4">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 transition-all"
            >
              <span className="text-xl">🚪</span>
              <span className="text-sm font-bold">Finalizar Partido</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {renderContent()}
      </main>
    </div>
  );
}
