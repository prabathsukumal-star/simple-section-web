import { cachedApiClient } from './cachedClient';

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
  instituteType: string | null;
  imgUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectsResponse {
  data: Subject[];
  total?: number;
  page?: number;
  limit?: number;
}

export const subjectsApi = {
  // Get all subjects for an institute
  getAll: (instituteId: string, forceRefresh = false) => {
    return cachedApiClient.get<Subject[]>(`/subjects/institute/${instituteId}`, undefined, {
      ttl: 300, // 5 minutes
      forceRefresh
    });
  },

  // Get a single subject by ID
  getById: (id: string, forceRefresh = false) => {
    return cachedApiClient.get<Subject>(`/subjects/${id}`, undefined, {
      ttl: 300,
      forceRefresh
    });
  },

  // Create a new subject (handled directly in CreateSubjectForm due to FormData)
  create: (data: FormData) => {
    // This is handled directly in the form component due to FormData requirements
    throw new Error('Subject creation is handled directly in CreateSubjectForm component');
  },

  // Update a subject
  update: (id: string, data: Partial<Subject>) => {
    return cachedApiClient.patch<Subject>(`/subjects/${id}`, data);
  },

  // Delete a subject
  delete: (id: string) => {
    return cachedApiClient.delete<void>(`/subjects/${id}`);
  },

  // Check if subjects are cached
  hasCache: (instituteId: string) => {
    return cachedApiClient.hasCache(`/subjects/institute/${instituteId}`, undefined);
  },

  // Get cached subjects
  getCached: (instituteId: string) => {
    return cachedApiClient.getCachedOnly<Subject[]>(`/subjects/institute/${instituteId}`, undefined);
  },

  // Preload subjects
  preload: async (instituteId: string) => {
    await cachedApiClient.preload<Subject[]>(`/subjects/institute/${instituteId}`, undefined, 300);
  }
};