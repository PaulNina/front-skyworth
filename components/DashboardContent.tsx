import React from 'react';

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

interface DashboardContentProps {
  resumen: DashboardResumen;
  modelosEstrella: ModeloEstrella[];
  mapaCalor: MapaCalor[];
  ritmoJuego: RitmoJuego[];
  diasRitmo: 7 | 30;
  onChangeDiasRitmo: (dias: 7 | 30) => void;
}

export default function DashboardContent({
  resumen,
  modelosEstrella,
  mapaCalor,
  ritmoJuego,
  diasRitmo,
  onChangeDiasRitmo,
}: DashboardContentProps) {
  // Prepara los datos rellenando los días faltantes con 0
  const chartData = React.useMemo(() => {
    const days = [];
    const today = new Date();
    
    // Generar array con los últimos N días
    for (let i = diasRitmo - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      // Formato YYYY-MM-DD local
      const fechaStr = d.toLocaleDateString('en-CA'); 
      
      const found = ritmoJuego.find(r => r.fecha === fechaStr);
      days.push({
        fecha: fechaStr,
        cantidad: found ? found.cantidad : 0,
        originalDate: d
      });
    }
    return days;
  }, [ritmoJuego, diasRitmo]);

  // Calculate max for chart scaling (plus 25% buffer for visibility)
  const maxVenta = Math.max(...chartData.map(r => r.cantidad), 0);
  // Si maxVenta es 0 (no hay ventas), usamos 10 para que no se rompa la escala
  const maxCantidad = (maxVenta || 10) * 1.25;

  return (
    <>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-sport text-skyworth-dark">ESTADÍSTICAS DEL TORNEO</h2>
          <p className="text-sm text-gray-500 mt-1">Temporada Skyworth 2026</p>
        </div>
        <div className="text-sm text-gray-500">📅 {new Date().toLocaleDateString('es-BO')}</div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Jugadores Inscritos
          </p>
          <div className="flex items-end justify-between">
            <div className="text-5xl font-black text-skyworth-dark">{resumen.jugadoresInscritos.toLocaleString()}</div>
            <div className="text-green-600 text-sm font-bold flex items-center gap-1">
              <span>▲</span> Activos
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-yellow-500">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Cupones Emitidos
          </p>
          <div className="flex items-end justify-between">
            <div className="text-5xl font-black text-skyworth-dark">{resumen.seriesCanjeadas.toLocaleString()}</div>
            <div className="text-yellow-600 text-sm font-bold flex items-center gap-1">
              <span>🎟️</span> Tickets
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Seriales Disponibles
          </p>
          <div className="flex items-end justify-between">
            <div className="text-5xl font-black text-skyworth-dark">{resumen.serialesDisponibles.toLocaleString()}</div>
            <div className="text-blue-600 text-sm font-bold flex items-center gap-1">
              <span>📦</span> Stock
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Modelos Estrella */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⭐</span>
            <h3 className="text-lg font-sport text-skyworth-dark">MODELOS ESTRELLA</h3>
          </div>
          {modelosEstrella.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              No hay datos disponibles
            </div>
          ) : (
            <div className="space-y-3">
              {modelosEstrella.map((modelo, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-800">{modelo.nombreVendedor}</p>
                    <p className="text-xs text-gray-500">{modelo.tienda} - {modelo.ciudad}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-skyworth-blue">{modelo.cantidadVentas}</p>
                    <p className="text-xs text-gray-400">ventas</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapa de Calor */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🗺️</span>
            <h3 className="text-lg font-sport text-skyworth-dark">MAPA DE CALOR</h3>
          </div>
          {mapaCalor.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Generando territorio...
            </div>
          ) : (
            <div className="space-y-4">
              {mapaCalor.map((ciudad, idx) => {
                const maxVentas = Math.max(...mapaCalor.map(c => c.cantidadVentas), 1);
                const percentage = (ciudad.cantidadVentas / maxVentas) * 100;
                const colorClass = 
                  ciudad.departamento === 'La Paz' ? 'bg-blue-500' :
                  ciudad.departamento === 'Cochabamba' ? 'bg-green-500' :
                  'bg-orange-500';
                
                return (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-gray-700">{ciudad.departamento}</span>
                      <span className="font-black text-skyworth-blue">{ciudad.cantidadVentas}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${colorClass} h-3 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ritmo de Juego */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-sport text-skyworth-dark">RITMO DE JUEGO (ÚLTIMOS {diasRitmo} DÍAS)</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onChangeDiasRitmo(7)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                diasRitmo === 7
                  ? 'bg-skyworth-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              7 días
            </button>
            <button
              onClick={() => onChangeDiasRitmo(30)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                diasRitmo === 30
                  ? 'bg-skyworth-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              30 días
            </button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            No hay datos disponibles
          </div>
        ) : (
          <div className="flex items-stretch gap-2 justify-between h-64 border-b border-gray-100 pb-2">
            {chartData.map((dia, idx) => {
              const height = (dia.cantidad / maxCantidad) * 100;
              const isToday = idx === chartData.length - 1;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full">
                  <div className="flex-1 flex items-end justify-center w-full relative">
                    
                    {/* Barra */}
                    <div
                      className={`w-full rounded-t-sm transition-all relative ${
                        dia.cantidad > 0 
                          ? 'bg-gradient-to-t from-skyworth-blue to-blue-400 hover:from-skyworth-accent hover:to-yellow-400 cursor-pointer shadow-sm' 
                          : 'bg-gray-100 hover:bg-gray-200 h-1'
                      }`}
                      style={{ 
                        height: dia.cantidad > 0 ? `${height}%` : '4px',
                        minHeight: dia.cantidad > 0 ? '4px' : '4px'
                      }}
                    >
                        {/* Número Total Arriba de la Columna */}
                        {dia.cantidad > 0 && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 font-black text-xs md:text-sm text-skyworth-blue whitespace-nowrap opacity-80 hover:opacity-100 transition-opacity">
                                {dia.cantidad}
                            </div>
                        )}
                        
                        {dia.cantidad > 0 && (
                            <div className="absolute top-0 w-full h-[2px] bg-white/30"></div>
                        )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center h-6 justify-start">
                    <span className={`text-[10px] md:text-xs font-bold whitespace-nowrap ${isToday ? 'text-skyworth-blue' : 'text-gray-400'}`}>
                      {dia.originalDate.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
