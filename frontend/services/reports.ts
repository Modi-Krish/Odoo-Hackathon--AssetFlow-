import apiClient from './api';
import { Report } from '../types/report';

export const getReports = async (): Promise<Report[]> => {
  const response = await apiClient.get<Report[]>(`/reports`);
  return response.data.data;
};
