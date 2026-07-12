import axios from 'axios';
import { Report } from '../types/report';

const API_BASE_URL = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') : 'http://localhost:5000/api';

export const getReports = async (): Promise<Report[]> => {
  const response = await axios.get<Report[]>(`${API_BASE_URL}/reports`);
  return response.data;
};
