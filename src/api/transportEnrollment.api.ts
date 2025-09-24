import { getAttendanceUrl, getApiHeaders } from '@/contexts/utils/auth.api';

export interface TransportEnrollmentRequest {
  studentId: string;
  studentName: string;
  bookhireId: string;
  startDate: string;
  endDate: string;
  parentContact: string;
  emergencyContact: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  dropoffTime: string;
  specialInstructions?: string;
  monthlyFee: number;
}

export interface TransportEnrollmentResponse {
  studentId: string;
  studentName: string;
  bookhireId: string;
  ownerId: string;
  enrollmentDate: string;
  startDate: string;
  endDate: string;
  status: string;
  parentContact: string;
  emergencyContact: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  dropoffTime: string;
  specialInstructions?: string;
  monthlyFee: number;
  isActive: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const enrollInTransport = async (
  enrollmentData: TransportEnrollmentRequest
): Promise<TransportEnrollmentResponse> => {
  try {
    console.log('Enrolling in transport:', enrollmentData);
    
    const baseUrl = getAttendanceUrl();
    if (!baseUrl) {
      throw new Error('Attendance backend URL not configured. Please set the attendance backend URL in Settings.');
    }
    
    const url = `${baseUrl}/api/student-bookhire-enrollment/enroll`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...getApiHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrollmentData),
    });
    
    if (!response.ok) {
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = errorData.message || JSON.stringify(errorData);
      } catch {
        errorText = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorText);
    }
    
    const result = await response.json();
    console.log('Transport enrollment successful:', result);
    return result;
  } catch (error) {
    console.error('Transport enrollment failed:', error);
    throw error;
  }
};