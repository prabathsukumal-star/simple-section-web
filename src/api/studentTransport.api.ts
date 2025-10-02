import { getAttendanceUrl, getBaseUrl, getApiHeaders } from '@/contexts/utils/auth.api';

export interface TransportEnrollment {
  _id: string;
  studentId: string;
  studentName: string;
  bookhireId: {
    _id: string;
    title: string;
    vehicleNumber: string;
    year: number;
    route: string;
    capacity: number;
  };
  ownerId: {
    _id: string;
    ownerName: string;
    businessName: string;
    phoneNumber: string;
  };
  enrollmentDate: string;
  startDate: string;
  endDate?: string;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  parentContact: string;
  emergencyContact: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  dropoffTime: string;
  specialInstructions?: string;
  monthlyFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentTransportResponse {
  enrollments: TransportEnrollment[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export const getStudentTransportEnrollments = async (
  studentId: string,
  params?: { page?: number; limit?: number }
): Promise<StudentTransportResponse> => {
  const { page = 1, limit = 10 } = params || {};
  
  // Use attendance-specific URL first, fallback to main API URL
  let baseUrl = getAttendanceUrl();
  if (!baseUrl) {
    baseUrl = getBaseUrl();
  }
  
  // Ensure base URL doesn't end with slash
  baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  const url = `${baseUrl}/api/student-bookhire-enrollment/student/${studentId}?page=${page}&limit=${limit}`;
  
  console.log('=== STUDENT TRANSPORT API CALL ===');
  console.log('Attendance URL from config:', getAttendanceUrl());
  console.log('Base URL from config:', getBaseUrl());
  console.log('Using base URL:', baseUrl);
  console.log('Full URL:', url);
  
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
    
    console.error('Transport API Error:', errorData);
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
  }

  const data = await response.json();
  console.log('Transport API Response:', data);
  return data;
};