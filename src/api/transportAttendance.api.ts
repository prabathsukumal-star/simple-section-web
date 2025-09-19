import { cachedApiClient } from './cachedClient';
import { getBaseUrl } from '@/contexts/utils/auth.api';

export interface TransportAttendanceRecord {
  _id: string;
  studentId: string;
  bookhireId: {
    _id: string;
    title: string;
    vehicleNumber: string;
  };
  ownerId: string;
  date: string;
  time: string;
  status: 'PRESENT' | 'ABSENT';
  studentName: string;
  vehicleNumber: string;
  markedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TransportAttendanceResponse {
  success: boolean;
  message: string;
  data: TransportAttendanceRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const getStudentTransportAttendance = async (
  studentId: string,
  page: number = 1,
  limit: number = 10
): Promise<TransportAttendanceResponse> => {
  try {
    const endpoint = `/api/bookhire-attendance/student/${studentId}`;
    const params = { page: page.toString(), limit: limit.toString() };
    const response = await cachedApiClient.get(endpoint, params);
    return response;
  } catch (error) {
    console.error('Error fetching student transport attendance:', error);
    throw error;
  }
};