import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from "../config/api";
import { AuthData, ApiResponse } from "../types";

interface LoginRequest {
  email: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthData> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Error en el login. Verifica tus credenciales.");
    }

    const result: ApiResponse<AuthData> = await response.json();

    if (result.error) {
      throw new Error(result.message || "Error en el login");
    }

    // Save to localStorage
    localStorage.setItem("authToken", result.data.token);
    localStorage.setItem("userData", JSON.stringify(result.data));

    return result.data;
  }

  logout(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  }

  getCurrentUser(): AuthData | null {
    const userData = localStorage.getItem("userData");
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  getToken(): string | null {
    return localStorage.getItem("authToken");
  }
}

export default new AuthService();
