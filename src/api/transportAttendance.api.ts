import { cachedApiClient } from './cachedClient';

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

const getAttendanceUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';
  return `${baseUrl}/api/bookhire-attendance`;
};

export const getStudentTransportAttendance = async (
  studentId: string,
  page: number = 1,
  limit: number = 10
): Promise<TransportAttendanceResponse> => {
  try {
    const url = `${getAttendanceUrl()}/student/${studentId}?page=${page}&limit=${limit}`;
    const response = await cachedApiClient.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching student transport attendance:', error);
    throw error;
  }
};