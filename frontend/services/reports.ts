import apiClient from './api';
import { Report } from '../types/report';

export const getReports = async (): Promise<Report[]> => {
  const response = await apiClient.get<any>(`/reports`);
  return response.data.data;
};
