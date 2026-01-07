import React, { useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';

interface VendorFormData {
  nombre: string;
  ci: string;
  tienda: string;
  ciudad: string;
  email: string;
  password: string;
  rolNombre: 'ADMIN' | 'VENDEDOR';
}

export default function VendorRegistration() {
  const [formData, setFormData] = useState<VendorFormData>({
    nombre: '',
    ci: '',
    tienda: '',
    ciudad: '',
    email: '',
    password: '',
    rolNombre: 'VENDEDOR',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VENDOR_CREATE}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        setSuccess(`Vendedor ${formData.nombre} registrado exitosamente`);
        setFormData({
          nombre: '',
          ci: '',
          tienda: '',
          ciudad: '',
          email: '',
          password: '',
          rolNombre: 'VENDEDOR',
        });
      } else {
        setError(data.mensaje || 'Error al registrar vendedor');
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrar vendedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-sport text-skyworth-dark mb-2">REGISTRO DE VENDEDORES</h2>
        <p className="text-sm text-gray-500">Crear nuevos usuarios vendedores o administradores</p>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">👤</div>
            <div>
              <h3 className="text-2xl font-bold text-skyworth-dark">Nuevo Vendedor</h3>
              <p className="text-sm text-gray-500">Complete todos los campos del formulario</p>
            </div>
          </div>

          {success && (
            <div className="mb-6 bg-green-100 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-800 font-bold">✅ {success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-800 font-bold">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-skyworth-blue focus:outline-none"
                placeholder="Ej: Juan Pérez López"
              />
            </div>

            {/* CI y Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Carnet de Identidad *
                </label>
                <input
                  type="text"
                  name="ci"
                  value={formData.ci}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-skyworth-blue focus:outline-none"
                  placeholder="Ej: 1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-skyworth-blue focus:outline-none"
                  placeholder="Ej: juan@skyworth.com"
                />
              </div>
            </div>

            {/* Tienda y Ciudad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tienda *
                </label>
                <input
                  type="text"
                  name="tienda"
                  value={formData.tienda}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-skyworth-blue focus:outline-none"
                  placeholder="Ej: Tienda Central"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ciudad *
                </label>
                <select
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-skyworth-blue focus:outline-none"
                >
                  <option value="">Seleccione una ciudad</option>
                  <option value="La Paz">La Paz</option>
                  <option value="Cochabamba">Cochabamba</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                </select>
              </div>
            </div>

            {/* Password y Rol */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-skyworth-blue focus:outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  name="rolNombre"
                  value={formData.rolNombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-skyworth-blue focus:outline-none"
                >
                  <option value="VENDEDOR">VENDEDOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-skyworth-blue hover:bg-skyworth-dark text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Registrando...' : '✅ Registrar Vendedor'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Nota:</strong> Los vendedores podrán acceder al sistema con su email y contraseña.
            Los usuarios ADMIN tendrán acceso completo al sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
