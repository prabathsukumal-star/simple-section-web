import { enhancedCachedClient } from './enhancedCachedClient';
import { ApiResponse } from './client';

export interface ExamResult {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  studentId: string;
  examId: string;
  score: string;
  grade: string;
  remarks: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  exam: {
    id: string;
    title: string;
    examType: string;
  };
}

export interface ExamResultsQueryParams {
  page?: number;
  limit?: number;
  instituteId?: string;
  classId?: string;
  subjectId?: string;
  examId?: string;
  userId?: string;
  role?: string;
}

export interface ExamResultsResponse {
  data: ExamResult[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    previousPage: number | null;
    nextPage: number | null;
  };
}

class ExamResultsApi {
  async getExamResults(params?: ExamResultsQueryParams, forceRefresh = false): Promise<ExamResultsResponse> {
    console.log('Fetching exam results:', params, { forceRefresh });
    return enhancedCachedClient.get<ExamResultsResponse>('/institute-class-subject-resaults', params, {
      forceRefresh,
      ttl: 30,
      useStaleWhileRevalidate: true,
      userId: params?.userId,
      instituteId: params?.instituteId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      role: params?.role
    });
  }

  // Utility methods
  hasResultsCached(params?: ExamResultsQueryParams): Promise<boolean> {
    return enhancedCachedClient.hasCache('/institute-class-subject-resaults', params, {
      userId: params?.userId,
      instituteId: params?.instituteId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      role: params?.role
    });
  }

  getCachedResults(params?: ExamResultsQueryParams): Promise<ExamResultsResponse | null> {
    return enhancedCachedClient.getCachedOnly<ExamResultsResponse>('/institute-class-subject-resaults', params, {
      userId: params?.userId,
      instituteId: params?.instituteId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      role: params?.role
    });
  }

  async preloadResults(params?: ExamResultsQueryParams): Promise<void> {
    await enhancedCachedClient.get<ExamResultsResponse>('/institute-class-subject-resaults', params, {
      ttl: 30,
      userId: params?.userId,
      instituteId: params?.instituteId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      role: params?.role
    });
  }
}

export const examResultsApi = new ExamResultsApi();