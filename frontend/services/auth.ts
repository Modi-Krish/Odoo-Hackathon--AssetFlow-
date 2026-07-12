import apiClient from './api';
import { User } from '../types';

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}

export const loginAPI = async (email: string, password?: string): Promise<AuthResponse> => {
  // Pass a default password for hackathon 1-click accounts if none provided
  const loginPassword = password || 'password123';
  const response = await apiClient.post<AuthResponse>('/auth/login', { email, password: loginPassword });
  return response.data;
};

export const signupAPI = async (name: string, email: string, password?: string): Promise<AuthResponse> => {
  const signupPassword = password || 'password123';
  const response = await apiClient.post<AuthResponse>('/auth/signup', { name, email, password: signupPassword });
  return response.data;
};

export const getProfileAPI = async (): Promise<AuthResponse> => {
  const response = await apiClient.get<AuthResponse>('/auth/profile');
  return response.data;
};
