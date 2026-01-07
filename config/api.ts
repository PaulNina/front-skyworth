// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",

  // Registration
  REGISTER_CLIENT: "/api/registro",

  // Dashboard
  DASHBOARD_RESUMEN: "/api/dashboard/resumen",
  DASHBOARD_MODELOS_ESTRELLA: (limit: number = 10) =>
    `/api/dashboard/modelos-estrella?limit=${limit}`,
  DASHBOARD_MAPA_CALOR: "/api/dashboard/mapa-calor",
  DASHBOARD_RITMO_JUEGO: (dias: number = 7) =>
    `/api/dashboard/ritmo-juego?dias=${dias}`,

  // Admin - Vendors
  VENDORS_LIST: "/api/admin/vendedores",
  VENDOR_CREATE: "/api/admin/vendedor/crear",
  VENDOR_DEACTIVATE: (id: number) => `/api/admin/vendedor/${id}/desactivar`,

  // Admin - Serials
  SERIALS_LIST: "/api/admin/seriales",
  SERIALS_UPLOAD_CSV: "/api/admin/seriales/cargar-csv",
  SERIALS_STATS: "/api/admin/seriales/estadisticas",
  SERIALS_EXPORT_EXCEL: "/api/admin/seriales/exportar-excel",

  // Admin - Clients/Players
  CLIENTS_LIST: "/api/admin/clientes-cupones",
  CLIENT_IMAGE: (registroId: number, imageType: string) =>
    `/api/registro/${registroId}/imagen/${imageType}`,

  // Sorteo - Clients
  SORTEO_CLIENTES_REALIZAR: "/api/sorteo/clientes/realizar",
  SORTEO_CLIENTES_GANADORES: "/api/sorteo/clientes/ganadores",

  // Sorteo - Vendors
  SORTEO_VENDEDORES_REALIZAR: "/api/sorteo/vendedores/realizar",
  SORTEO_VENDEDORES_GANADORES: "/api/sorteo/vendedores/ganadores",

  // Admin - Configuration
  CONFIG_LIST: "/api/admin/configuracion",
  CONFIG_BY_CATEGORY: (categoria: string) =>
    `/api/admin/configuracion/categoria/${categoria}`,
  CONFIG_UPDATE: (clave: string) => `/api/admin/configuracion/${clave}`,
  CONFIG_TEST_WHATSAPP: "/api/admin/configuracion/probar-whatsapp",
  CONFIG_REFRESH_CACHE: "/api/admin/configuracion/refrescar-cache",
  CONFIG_STATS: "/api/admin/configuracion/estadisticas",

  // Config
  CONFIG: "/api/config",
};

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper to get auth headers for file uploads (no Content-Type)
export const getAuthHeadersForUpload = () => {
  const token = localStorage.getItem("authToken");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
