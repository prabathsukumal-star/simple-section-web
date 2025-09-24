import { getAttendanceUrl, getApiHeaders } from '@/contexts/utils/auth.api';

export interface BookhireAttendanceRecord {
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

export interface BookhireAttendanceResponse {
  success: boolean;
  message: string;
  data: BookhireAttendanceRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const getBookhireAttendance = async (
  bookhireId: string,
  studentId: string,
  page = 1,
  limit = 10
): Promise<BookhireAttendanceResponse> => {
  const baseUrl = getAttendanceUrl();
  
  if (!baseUrl) {
    throw new Error('Attendance URL not configured');
  }
  
  const url = `${baseUrl}/api/bookhire-attendance/${bookhireId}/student/${studentId}?page=${page}&limit=${limit}`;
  
  console.log('=== BOOKHIRE ATTENDANCE API CALL ===');
  console.log('URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getApiHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `HTTP Error: ${response.status}`,
      statusCode: response.status,
      error: response.statusText
    }));
    
    console.error('Bookhire Attendance API Error:', errorData);
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
  }

  const data = await response.json();
  console.log('Bookhire Attendance API Response:', data);
  return data;
};