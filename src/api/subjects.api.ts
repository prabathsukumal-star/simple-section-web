import { enhancedCachedClient } from './enhancedCachedClient';
import { getBaseUrl } from '@/contexts/utils/auth.api';

export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  creditHours: number;
  isActive: boolean;
  subjectType: string;
  basketCategory: string;
  instituteId: string;
  imgUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectStats {
  total: number;
  active: number;
  inactive: number;
}

export interface SubjectCategory {
  category: string;
  count: number;
}

export interface SubjectsResponse {
  data: Subject[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface SubjectQueryParams {
  userId?: string;
  role?: string;
  instituteId?: string;
  classId?: string;
  subjectId?: string;
  isActive?: boolean;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateSubjectData {
  code: string;
  name: string;
  description?: string;
  category?: string;
  creditHours?: number;
  isActive?: boolean;
  subjectType?: 'MAIN' | 'BASKET' | 'COMMON';
  basketCategory?: string;
  instituteId: string;
  imgUrl?: string;
}

export interface UpdateSubjectData {
  code?: string;
  name?: string;
  description?: string;
  category?: string;
  creditHours?: number;
  isActive?: boolean;
  subjectType?: string;
  basketCategory?: string;
  imgUrl?: string;
}

const getAuthToken = () => {
  return localStorage.getItem('access_token') || 
         localStorage.getItem('token') || 
         localStorage.getItem('authToken');
};

export const subjectsApi = {
  // Get all subjects for an institute (NEW API: uses instituteId query param)
  getAll: (instituteId: string, params?: SubjectQueryParams, forceRefresh = false) => {
    const queryParams: Record<string, string> = {
      instituteId,
      ...(params?.isActive !== undefined && { isActive: String(params.isActive) }),
      ...(params?.search && { search: params.search }),
      ...(params?.category && { category: params.category }),
      ...(params?.classId && { classId: params.classId }),
      ...(params?.page && { page: String(params.page) }),
      ...(params?.limit && { limit: String(params.limit) }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder })
    };
    
    return enhancedCachedClient.get<Subject[]>('/subjects', queryParams, {
      ttl: 20,
      forceRefresh,
      useStaleWhileRevalidate: true,
      userId: params?.userId,
      instituteId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      role: params?.role
    });
  },

  // Get subject statistics
  getStats: (instituteId: string, forceRefresh = false) => {
    return enhancedCachedClient.get<SubjectStats>('/subjects/stats', { instituteId }, {
      ttl: 60,
      forceRefresh,
      instituteId
    });
  },

  // Get subjects by category
  getCategories: (instituteId: string, forceRefresh = false) => {
    return enhancedCachedClient.get<SubjectCategory[]>('/subjects/categories', { instituteId }, {
      ttl: 60,
      forceRefresh,
      instituteId
    });
  },

  // Get subject by code
  getByCode: (code: string, instituteId: string, forceRefresh = false) => {
    return enhancedCachedClient.get<Subject>(`/subjects/code/${code}`, { instituteId }, {
      ttl: 20,
      forceRefresh,
      instituteId
    });
  },

  // Get a single subject by ID
  getById: (id: string, instituteId: string, forceRefresh = false) => {
    return enhancedCachedClient.get<Subject>(`/subjects/${id}`, { instituteId }, {
      ttl: 20,
      forceRefresh,
      instituteId,
      subjectId: id
    });
  },

  // Create a new subject (NEW API: POST /subjects with instituteId in body)
  create: async (data: CreateSubjectData): Promise<Subject> => {
    const baseUrl = getBaseUrl();
    const token = getAuthToken();
    
    const response = await fetch(`${baseUrl}/subjects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create subject');
    }
    
    return response.json();
  },

  // Update a subject (PATCH /subjects/:id)
  update: async (id: string, data: UpdateSubjectData): Promise<Subject> => {
    const baseUrl = getBaseUrl();
    const token = getAuthToken();
    
    const response = await fetch(`${baseUrl}/subjects/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update subject');
    }
    
    return response.json();
  },

  // Soft delete (deactivate) a subject
  deactivate: async (id: string): Promise<Subject> => {
    const baseUrl = getBaseUrl();
    const token = getAuthToken();
    
    const response = await fetch(`${baseUrl}/subjects/${id}/deactivate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to deactivate subject');
    }
    
    return response.json();
  },

  // Permanent delete a subject (SUPERADMIN only)
  delete: async (id: string): Promise<void> => {
    const baseUrl = getBaseUrl();
    const token = getAuthToken();
    
    const response = await fetch(`${baseUrl}/subjects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete subject');
    }
  },

  // Check if subjects are cached
  hasCache: (instituteId: string, params?: SubjectQueryParams) => {
    return enhancedCachedClient.hasCache('/subjects', { instituteId }, {
      userId: params?.userId,
      instituteId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      role: params?.role
    });
  },

  // Get cached subjects
  getCached: (instituteId: string, params?: SubjectQueryParams) => {
    return enhancedCachedClient.getCachedOnly<Subject[]>('/subjects', { instituteId }, {
      userId: params?.userId,
      instituteId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      role: params?.role
    });
  },

  // Preload subjects
  preload: async (instituteId: string, params?: SubjectQueryParams) => {
    await enhancedCachedClient.get<Subject[]>('/subjects', { instituteId }, {
      ttl: 20,
      userId: params?.userId,
      instituteId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      role: params?.role
    });
  }
};