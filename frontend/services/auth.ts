/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './api';
import { User } from '../types';

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
}

export const loginAPI = async (email: string, password?: string): Promise<AuthResponse> => {
  // Pass a default password for hackathon 1-click accounts if none provided
  const loginPassword = password || process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || 'password123';
  const response = await apiClient.post<any>('/auth/login', { email, password: loginPassword });
  return {
    message: response.data.message,
    token: response.data.data?.token,
    user: response.data.data?.user,
  };
};

export const signupAPI = async (name: string, email: string, password?: string): Promise<AuthResponse> => {
  const signupPassword = password || process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || 'password123';
  const response = await apiClient.post<any>('/auth/signup', { name, email, password: signupPassword });
  return {
    message: response.data.message,
    token: response.data.data?.token,
    user: response.data.data?.user,
  };
};

export const getProfileAPI = async (): Promise<AuthResponse> => {
  const response = await apiClient.get<any>('/auth/profile');
  return {
    message: response.data.message,
    token: response.data.data?.token,
    user: response.data.data?.user,
  };
};
