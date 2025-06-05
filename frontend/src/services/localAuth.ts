import { User } from '../types';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class LocalAuth {
  private currentUser: User | null = null;
  private token: string | null = null;

  constructor() {
    // Try to restore session from localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      this.token = savedToken;
      this.currentUser = JSON.parse(savedUser);
    }
  }

  private setAuth(token: string, user: User) {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearAuth() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async signIn(username: string, password: string): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: username,
        password
      });

      const { token, user } = response.data;
      this.setAuth(token, user);
      return user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error('An error occurred during sign in');
    }
  }

  async signOut(): Promise<void> {
    this.clearAuth();
  }

  async currentAuthenticatedUser(): Promise<User> {
    if (!this.token || !this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      // Verify the token is still valid by making a request to /me
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      const user = response.data as User;
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      this.clearAuth();
      throw new Error('Session expired');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
    } catch (error) {
      throw new Error('Failed to send password reset email');
    }
  }

  async forgotPasswordSubmit(email: string, code: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        code,
        newPassword
      });
    } catch (error) {
      throw new Error('Failed to reset password');
    }
  }
}

export const Auth = new LocalAuth(); 