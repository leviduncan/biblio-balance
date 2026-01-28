const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'auth_token';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async signup(email: string, password: string, username: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Signup failed');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Login failed');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch {
      this.removeToken();
      return null;
    }
  },

  logout() {
    this.removeToken();
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
};
