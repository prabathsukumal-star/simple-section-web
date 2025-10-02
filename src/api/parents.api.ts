
import { apiClient } from './client';

export interface ParentCreateData {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    nic?: string;
    birthCertificateNo?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    imageUrl?: string;
    isActive?: boolean;
    userType: string; // Add missing userType field
  };
  occupation: string;
  workplace?: string;
  workPhone?: string;
  educationLevel?: string;
  isActive?: boolean;
}

export interface Parent {
  userId: string;
  occupation: string;
  workplace?: string;
  workPhone?: string;
  educationLevel?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userType: string;
    dateOfBirth: string;
    gender: string;
    imageUrl?: string;
    isActive: boolean;
    subscriptionPlan: string;
    createdAt: string;
  };
}

export interface InstituteParent {
  id: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  phoneNumber?: string;
  imageUrl?: string;
  dateOfBirth?: string;
  userIdByInstitute: string | null;
  verifiedBy: string | null;
  occupation?: string;
  workPlace?: string;
}

export interface InstituteParentsResponse {
  data: InstituteParent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ParentsResponse {
  data: Parent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const parentsApi = {
  create: async (data: ParentCreateData): Promise<Parent> => {
    const response = await apiClient.post('/parents', data);
    return response.data;
  },
  
  getInstituteParents: async (instituteId: string, params?: { page?: number; limit?: number }): Promise<InstituteParentsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/institute-users/institute/${instituteId}/users/PARENT${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiClient.get(url);
    console.log('Raw response from API client:', response);
    // Return the response directly since apiClient.handleResponse already parses the JSON
    return response;
  },
  
};
