
export type UserRole = 'ADMIN' | 'VENDEDOR';

export interface AuthData {
  token: string;
  email: string;
  nombre: string;
  rol: UserRole;
}

export interface ApiResponse<T> {
  error: boolean;
  message: string; // Cambiado de mensaje a message para coincidir con la API
  data: T;
}

export interface Vendedor {
  id: number;
  nombre: string;
  ci: string;
  tienda: string;
  ciudad: string;
  email: string;
  activo: boolean;
  rolNombre: string;
}

export interface Participant {
  participantId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  code: string;
  sellerId?: string;
  ticketsCount: number;
  createdAt: any;
}

export interface RegistrationResponse {
  success: boolean;
  tickets: string[];
  message: string;
  participantId: string;
}
