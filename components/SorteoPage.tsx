import React, { useState } from 'react';
import SorteoClientes from './SorteoClientes';
import SorteoVendedores from './SorteoVendedores';

export default function SorteoPage() {
  const [tipoSorteo, setTipoSorteo] = useState<'clientes' | 'vendedores'>('clientes');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs */}
      <div className="bg-white shadow-sm border-b-2 border-gray-200">
        <div className="flex">
          <button
            onClick={() => setTipoSorteo('clientes')}
            className={`flex-1 py-4 px-6 text-center font-bold transition-all ${
              tipoSorteo === 'clientes'
                ? 'bg-yellow-400 text-skyworth-dark border-b-4 border-yellow-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl mr-2">🎟️</span>
            Sorteo Clientes (5 Ganadores)
          </button>
          <button
            onClick={() => setTipoSorteo('vendedores')}
            className={`flex-1 py-4 px-6 text-center font-bold transition-all ${
              tipoSorteo === 'vendedores'
                ? 'bg-blue-400 text-white border-b-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl mr-2">👔</span>
            Sorteo Vendedores (6 Ganadores)
          </button>
        </div>
      </div>

      {/* Content */}
      {tipoSorteo === 'clientes' ? <SorteoClientes /> : <SorteoVendedores />}
    </div>
  );
}
