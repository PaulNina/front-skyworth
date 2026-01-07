import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders, getAuthHeadersForUpload } from '../config/api';

interface Serial {
  id: number;
  code: string;
  tvModel: string;
  inches: number;
  ticketMultiplier: number;
  usado: boolean;
  fechaUso: string | null;
  registro: any | null;
}

interface SerialStats {
  disponibles: number;
  usados: number;
  total: number;
}

interface PaginatedResponse {
  content: Serial[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export default function SerialsManagement() {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [stats, setStats] = useState<SerialStats>({ disponibles: 0, usados: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'used'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchSerials();
    fetchStats();
  }, [currentPage, pageSize]);

  const fetchSerials = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SERIALS_LIST}?page=${currentPage}&size=${pageSize}`,
        {
          headers: getAuthHeaders(),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const paginatedData: PaginatedResponse = data.data;
        setSerials(paginatedData.content || []);
        setTotalPages(paginatedData.totalPages || 0);
        setTotalElements(paginatedData.totalElements || 0);
      } else {
        console.error('Error response:', response.status);
        setSerials([]);
      }
    } catch (error) {
      console.error('Error fetching serials:', error);
      setSerials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SERIALS_STATS}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || { disponibles: 0, usados: 0, total: 0 });
      } else {
        console.error('Error fetching stats:', response.status);
        setStats({ disponibles: 0, usados: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ disponibles: 0, usados: 0, total: 0 });
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCSV(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('archivo', file);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SERIALS_UPLOAD_CSV}`, {
        method: 'POST',
        headers: getAuthHeadersForUpload(),
        body: formData,
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        setSuccess(data.mensaje || 'Seriales cargados exitosamente');
        fetchSerials();
        fetchStats();
        e.target.value = '';
      } else {
        setError(data.mensaje || 'Error al cargar el CSV');
      }
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo');
    } finally {
      setUploadingCSV(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SERIALS_EXPORT_EXCEL}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `seriales_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('Excel exportado exitosamente');
      } else {
        setError('Error al exportar Excel');
      }
    } catch (err) {
      setError('Error al exportar Excel');
    }
  };

  const filteredSerials = serials.filter(serial => {
    const matchesSearch = 
      (serial.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (serial.tvModel?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    if (filter === 'available') return !serial.usado && matchesSearch;
    if (filter === 'used') return serial.usado && matchesSearch;
    return matchesSearch;
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-sport text-skyworth-dark mb-2">ALINEACIÓN DE PRODUCTOS</h2>
          <p className="text-sm text-gray-500">Gestiona los seriales de TV Skyworth</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
          >
            <span>📊</span>
            Exportar Excel
          </button>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
            📅 {new Date().toLocaleDateString('es-BO')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* CSV Upload Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-skyworth-dark mb-4">IMPORTAR PLANTILLA TÁCTICA</h3>
          
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">Formato CSV (code, tvModel, inches, ticketMultiplier)</p>
            <p className="text-xs text-gray-400">Columnas: Code - Modelo - Pulgadas - Multiplicador</p>
          </div>

          <div className="flex gap-3">
            <label className="flex-1">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={uploadingCSV}
                className="hidden"
                id="csv-file-input"
              />
              <div className="bg-skyworth-blue hover:bg-skyworth-dark text-white px-6 py-3 rounded-lg cursor-pointer text-center font-bold transition-all">
                {uploadingCSV ? '⏳ Subiendo...' : 'Seleccionar archivo'}
              </div>
            </label>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-skyworth-dark px-6 py-3 rounded-lg font-bold transition-all">
              DEMO
            </button>
          </div>

          {success && (
            <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <p className="text-green-800 text-sm font-bold">✅ {success}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-red-800 text-sm font-bold">❌ {error}</p>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-skyworth-dark mb-4">BUSCAR EN LA PLANTILLA</h3>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Buscar por código o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-skyworth-blue focus:outline-none"
            />
            <button className="bg-skyworth-dark hover:bg-skyworth-blue text-white px-6 py-3 rounded-lg font-bold transition-all">
              🔍
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'all'
                  ? 'bg-skyworth-dark text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('used')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'used'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Usados
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'available'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Libres
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-skyworth-blue">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total</p>
          <div className="text-4xl font-black text-skyworth-blue">{stats.total.toLocaleString()}</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Disponibles</p>
          <div className="text-4xl font-black text-green-600">{stats.disponibles.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-500">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Usados</p>
          <div className="text-4xl font-black text-red-600">{stats.usados.toLocaleString()}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Pagination Controls Top */}
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
              <option value={500}>500</option>
            </select>
            <span className="text-sm text-gray-600">registros por página</span>
          </div>
          
          <div className="text-sm text-gray-600 font-bold">
            Mostrando {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements.toLocaleString()} registros
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl mb-3">⚽</div>
            <p className="text-gray-500 font-bold">Cargando seriales...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-skyworth-dark text-white">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-sm uppercase tracking-wider">
                    Código
                  </th>
                  <th className="text-left py-4 px-6 font-bold text-sm uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider">
                    Pulgadas
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider">
                    Multiplicador
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider">
                    Fecha Uso
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-sm uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSerials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="text-5xl mb-3">📦</div>
                      <p className="text-gray-500 font-bold">
                        {searchTerm ? 'No se encontraron resultados' : 'No se documentaron códigos'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSerials.map((serial) => (
                    <tr key={serial.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-sm text-skyworth-blue">
                        {serial.code || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-800">
                        {serial.tvModel || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">
                          {serial.inches}"
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                          x{serial.ticketMultiplier}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 text-center">
                        {serial.fechaUso ? new Date(serial.fechaUso).toLocaleDateString('es-BO') : '-'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-block px-4 py-1 rounded-full text-xs font-bold ${
                            serial.usado
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {serial.usado ? 'USADO' : 'LIBRE'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls Bottom */}
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
