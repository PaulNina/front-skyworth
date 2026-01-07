import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

interface Cupon {
  id: number;
  codigo: string;
  estado: string;
  fechaGeneracion: string;
  fechaSorteo: string | null;
}

interface Cliente {
  registroId: number;
  nombreCliente: string;
  ci: string;
  email: string;
  telefono: string;
  serialTv: string;
  modeloTv: string;
  tamanoTv: number;
  cantidadCupones: number;
  cupones: Cupon[];
  fechaRegistro: string;
  nombreVendedor: string;
}

interface PaginatedResponse {
  content: Cliente[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export default function PlayersManagement() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchClientes();
  }, [currentPage, pageSize]);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CLIENTS_LIST}?page=${currentPage}&size=${pageSize}`,
        {
          headers: getAuthHeaders(),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const paginatedData: PaginatedResponse = data.data;
        setClientes(paginatedData.content || []);
        setTotalPages(paginatedData.totalPages || 0);
        setTotalElements(paginatedData.totalElements || 0);
      } else {
        console.error('Error response:', response.status);
        setClientes([]);
      }
    } catch (error) {
      console.error('Error fetching clientes:', error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = async (registroId: number, imageType: 'ci_anverso' | 'ci_reverso' | 'nota_venta') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CLIENT_IMAGE(registroId, imageType)}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${imageType}_${registroId}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  };

  const handleDownloadAllImages = async (cliente: Cliente) => {
    await handleDownloadImage(cliente.registroId, 'ci_anverso');
    setTimeout(() => handleDownloadImage(cliente.registroId, 'ci_reverso'), 300);
    setTimeout(() => handleDownloadImage(cliente.registroId, 'nota_venta'), 600);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };

  const filteredClientes = clientes.filter(cliente => 
    (cliente.nombreCliente?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (cliente.ci?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (cliente.serialTv?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (cliente.modeloTv?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-sport text-skyworth-dark mb-2">FICHAJES REGISTRADOS</h2>
          <p className="text-sm text-gray-500">Gestiona los jugadores y sus cupones</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2">
            <span>📊</span>
            Exportar Reporte
          </button>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
            📅 {new Date().toLocaleDateString('es-BO')}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar Ficha o TV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-skyworth-blue focus:outline-none"
          />
          <button className="bg-skyworth-dark hover:bg-skyworth-blue text-white px-8 py-3 rounded-lg font-bold transition-all">
            FILTRAR
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Pagination Top */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-bold">Mostrar:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-skyworth-blue focus:outline-none font-bold"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">registros por página</span>
          </div>
          
          <div className="text-sm text-gray-600 font-bold">
            Mostrando {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements.toLocaleString()} jugadores
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl mb-3">⚽</div>
            <p className="text-gray-500 font-bold">Cargando jugadores...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-skyworth-dark text-white">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-sm uppercase tracking-wider">Fecha</th>
                  <th className="text-left py-4 px-6 font-bold text-sm uppercase tracking-wider">Jugador</th>
                  <th className="text-left py-4 px-6 font-bold text-sm uppercase tracking-wider">Campaña</th>
                  <th className="text-left py-4 px-6 font-bold text-sm uppercase tracking-wider">Equipo (TV)</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider">Tickets</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider">Docs</th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="text-5xl mb-3">👥</div>
                      <p className="text-gray-500 font-bold">
                        {searchTerm ? 'No se encontraron jugadores' : 'Sin registros en la tabla'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente) => (
                    <tr key={cliente.registroId} className="hover:bg-gray-50 transition-colors">
                      {/* Fecha */}
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(cliente.fechaRegistro).toLocaleDateString('es-BO')}
                      </td>

                      {/* Jugador */}
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-sm text-skyworth-dark">{cliente.nombreCliente}</p>
                          <p className="text-xs text-gray-500">CI: {cliente.ci}</p>
                          <p className="text-xs text-gray-500">📧 {cliente.email}</p>
                          <p className="text-xs text-gray-500">📱 {cliente.telefono}</p>
                        </div>
                      </td>

                      {/* Campaña */}
                      <td className="py-4 px-6">
                        <p className="text-sm font-bold text-gray-800">Skyworth 2026</p>
                        <p className="text-xs text-gray-500">Vendedor: {cliente.nombreVendedor}</p>
                      </td>

                      {/* Equipo (TV) */}
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-mono font-bold text-sm text-skyworth-blue">{cliente.serialTv}</p>
                          <p className="text-xs text-gray-600">{cliente.modeloTv}</p>
                          <span className="inline-block mt-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">
                            {cliente.tamanoTv}"
                          </span>
                        </div>
                      </td>

                      {/* Tickets */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-black">
                            {cliente.cantidadCupones} 🎟️
                          </span>
                          <div className="mt-2 space-y-1">
                            {cliente.cupones.map((cupon, idx) => (
                              <div key={cupon.id} className="text-xs">
                                <span className="font-mono text-gray-600">{cupon.codigo}</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full ${
                                  cupon.estado === 'ACTIVO' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {cupon.estado}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Docs */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-2 items-center">
                          <button
                            onClick={() => handleDownloadImage(cliente.registroId, 'ci_anverso')}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg font-bold transition-all"
                            title="Descargar CI Anverso"
                          >
                            🆔 Anverso
                          </button>
                          <button
                            onClick={() => handleDownloadImage(cliente.registroId, 'ci_reverso')}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg font-bold transition-all"
                            title="Descargar CI Reverso"
                          >
                            🆔 Reverso
                          </button>
                          <button
                            onClick={() => handleDownloadImage(cliente.registroId, 'nota_venta')}
                            className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-lg font-bold transition-all"
                            title="Descargar Nota de Venta"
                          >
                            🧾 Factura
                          </button>
                          <button
                            onClick={() => handleDownloadAllImages(cliente)}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-lg font-bold transition-all"
                            title="Descargar Todos"
                          >
                            📥 Todos
                          </button>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-6 text-center">
                        <button className="text-xs bg-skyworth-blue hover:bg-skyworth-dark text-white px-3 py-2 rounded-lg font-bold transition-all">
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bottom */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-skyworth-blue text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-skyworth-dark transition-all"
          >
            ← Anterior
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-skyworth-dark text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 bg-skyworth-blue text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-skyworth-dark transition-all"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
