import { attendanceApiClient } from './attendanceClient';
import type { CachedRequestOptions } from './attendanceClient';
import type {
  AttendanceStatus,
  AttendanceUserType as AttUserType,
  AttendanceQueryResponse,
  CardUserResponse,
  BulkAttendancePayload,
  BulkAttendanceResponse,
  BulkCardAttendancePayload,
  MarkAttendancePayload,
  MarkAttendanceResponse,
  MarkByCardPayload,
  MarkByCardResponse as MarkCardResp,
  MarkByInstituteCardPayload,
  MarkByInstituteCardResponse,
} from '@/types/attendance.types';

// Re-export for backward compatibility
export type AdminAttendanceRecord = import('@/types/attendance.types').AttendanceRecord;
export type AdminAttendanceResponse = AttendanceQueryResponse;
export type AdminUserType = AttUserType;

export { type CardUserResponse } from '@/types/attendance.types';

// ── Helpers ────────────────────────────────────────────────────

/** Fetch attendance in ≤5-day windows (backend constraint for institute/class/subject queries) */
export async function fetchMultiWindow(
  endpoint: string,
  startDate: string,
  endDate: string,
  extraParams: Record<string, any> = {},
  options?: CachedRequestOptions
): Promise<AdminAttendanceRecord[]> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const allRecords: AdminAttendanceRecord[] = [];
  let windowStart = new Date(start);

  while (windowStart <= end) {
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + 4); // 5-day window
    if (windowEnd > end) windowEnd.setTime(end.getTime());

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    try {
      const res = await attendanceApiClient.get<AdminAttendanceResponse>(endpoint, {
        startDate: fmt(windowStart),
        endDate: fmt(windowEnd),
        limit: 100,
        page: 1,
        ...extraParams,
      }, options);
      if (res?.data) allRecords.push(...res.data);
    } catch (e) {
      console.warn('Window fetch failed:', fmt(windowStart), '-', fmt(windowEnd), e);
    }

    windowStart.setDate(windowStart.getDate() + 5);
  }
  return allRecords;
}

// ── API ────────────────────────────────────────────────────────

const adminAttendanceApi = {

  // ══════════════════════════════════════════════════════════════
  // MARK APIs (Section 2)
  // ══════════════════════════════════════════════════════════════

  /** 2.1 — Mark single attendance */
  markAttendance(payload: MarkAttendancePayload) {
    return attendanceApiClient.post<MarkAttendanceResponse>(
      `/api/attendance/mark`,
      payload
    );
  },

  /** 2.2 — Mark bulk attendance (max 100) */
  markBulkAttendance(payload: BulkAttendancePayload) {
    return attendanceApiClient.post<BulkAttendanceResponse>(
      `/api/attendance/mark-bulk`,
      payload
    );
  },

  /** 2.3 — Mark by RFID card */
  markByCard(payload: MarkByCardPayload) {
    return attendanceApiClient.post<MarkCardResp>(
      `/api/attendance/mark-by-card`,
      payload
    );
  },

  /** 2.4 — Mark bulk by RFID cards (max 100) */
  markBulkByCard(payload: BulkCardAttendancePayload) {
    return attendanceApiClient.post<BulkAttendanceResponse>(
      `/api/attendance/mark-bulk-by-card`,
      payload
    );
  },

  /** 2.5 — Mark by institute card */
  markByInstituteCard(payload: MarkByInstituteCardPayload) {
    return attendanceApiClient.post<MarkByInstituteCardResponse>(
      `/api/attendance/mark-by-institute-card`,
      payload
    );
  },

  // ══════════════════════════════════════════════════════════════
  // QUERY APIs (Section 3)
  // ══════════════════════════════════════════════════════════════

  /** 3.1 — Get student attendance */
  getStudentAttendance(
    studentId: string,
    params: { instituteId: string; startDate: string; endDate: string; page?: number; limit?: number; status?: AttendanceStatus },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/student/${studentId}`,
      params,
      options
    );
  },

  /** 3.2 — Get student attendance by card ID */
  getAttendanceByCardId(
    cardId: string,
    params?: { startDate?: string; endDate?: string; page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/by-cardId/${cardId}`,
      params,
      options
    );
  },

  /** 3.3 — Get institute attendance (max 5-day range, or 30 with studentId) */
  getInstituteAttendance(
    instituteId: string,
    params: { startDate: string; endDate: string; page?: number; limit?: number; status?: AttendanceStatus; studentId?: string },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/institute/${instituteId}`,
      params,
      options
    );
  },

  /** Multi-window institute attendance for ranges > 5 days */
  getInstituteAttendanceRange(
    instituteId: string,
    startDate: string,
    endDate: string,
    options?: CachedRequestOptions
  ) {
    return fetchMultiWindow(`/api/attendance/institute/${instituteId}`, startDate, endDate, {}, options);
  },

  /** 3.4 — Get class attendance */
  getClassAttendance(
    instituteId: string,
    classId: string,
    params: { startDate: string; endDate: string; page?: number; limit?: number; status?: AttendanceStatus; studentId?: string },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/institute/${instituteId}/class/${classId}`,
      params,
      options
    );
  },

  /** 3.5 — Get subject attendance */
  getSubjectAttendance(
    instituteId: string,
    classId: string,
    subjectId: string,
    params: { startDate: string; endDate: string; page?: number; limit?: number; status?: AttendanceStatus; studentId?: string },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/institute/${instituteId}/class/${classId}/subject/${subjectId}`,
      params,
      options
    );
  },

  /** 3.6 — Get class student attendance (max 365 days) */
  getClassStudentAttendance(
    instituteId: string,
    classId: string,
    studentId: string,
    params: { startDate: string; endDate: string; page?: number; limit?: number; status?: AttendanceStatus },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/institute/${instituteId}/class/${classId}/student/${studentId}`,
      params,
      options
    );
  },

  /** 3.7 — Get subject student attendance (max 365 days) */
  getSubjectStudentAttendance(
    instituteId: string,
    classId: string,
    subjectId: string,
    studentId: string,
    params: { startDate: string; endDate: string; page?: number; limit?: number; status?: AttendanceStatus },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/institute/${instituteId}/class/${classId}/subject/${subjectId}/student/${studentId}`,
      params,
      options
    );
  },

  // ══════════════════════════════════════════════════════════════
  // CARD USER LOOKUP (Section 4)
  // ══════════════════════════════════════════════════════════════

  /** 4.1 — Get institute user by card ID */
  getCardUser(
    instituteCardId: string,
    instituteId: string,
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<CardUserResponse>(
      `/api/attendance/institute-card-user`,
      { instituteCardId, instituteId },
      options
    );
  },

  /** 4.2 — Class-scoped card user lookup */
  getClassCardUser(
    instituteId: string,
    classId: string,
    instituteCardId: string,
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<CardUserResponse>(
      `/api/attendance/institute/${instituteId}/class/${classId}/card-user`,
      { instituteCardId },
      options
    );
  },

  /** 4.3 — Subject-scoped card user lookup */
  getSubjectCardUser(
    instituteId: string,
    classId: string,
    subjectId: string,
    instituteCardId: string,
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<CardUserResponse>(
      `/api/attendance/institute/${instituteId}/class/${classId}/subject/${subjectId}/card-user`,
      { instituteCardId },
      options
    );
  },

  // ══════════════════════════════════════════════════════════════
  // CALENDAR-LINKED QUERIES (Section 5)
  // ══════════════════════════════════════════════════════════════

  /** 5.1 — Get attendance by event */
  getEventAttendance(
    instituteId: string,
    eventId: string,
    params?: { date?: string; classId?: string; subjectId?: string; page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/calendar/institute/${instituteId}/event/${eventId}`,
      params,
      options
    );
  },

  /** 5.2 — Get attendance by calendar day */
  getCalendarDayAttendance(
    instituteId: string,
    calendarDayId: string,
    params?: { userType?: string; classId?: string; subjectId?: string; page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/calendar/institute/${instituteId}/calendar-day/${calendarDayId}`,
      params,
      options
    );
  },

  /** 5.3 — Get attendance by user type (institute scope) */
  getAttendanceByUserType(
    instituteId: string,
    userType: AttUserType,
    params?: { date?: string; eventId?: string; page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/calendar/institute/${instituteId}/user-type/${userType}`,
      params,
      options
    );
  },

  /** 5.4 — Get attendance by user type (class scope) */
  getClassAttendanceByUserType(
    instituteId: string,
    classId: string,
    userType: AttUserType,
    params?: { date?: string; eventId?: string; page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/calendar/institute/${instituteId}/class/${classId}/user-type/${userType}`,
      params,
      options
    );
  },

  /** 5.5 — Get attendance by user type (subject scope) */
  getSubjectAttendanceByUserType(
    instituteId: string,
    classId: string,
    subjectId: string,
    userType: AttUserType,
    params?: { date?: string; eventId?: string; page?: number; limit?: number },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/calendar/institute/${instituteId}/class/${classId}/subject/${subjectId}/user-type/${userType}`,
      params,
      options
    );
  },

  /** 5.6 — Get student attendance at event */
  getStudentEventAttendance(
    instituteId: string,
    studentId: string,
    eventId: string,
    params?: { startDate?: string; endDate?: string; classId?: string; subjectId?: string },
    options?: CachedRequestOptions
  ) {
    return attendanceApiClient.get<AttendanceQueryResponse>(
      `/api/attendance/calendar/institute/${instituteId}/student/${studentId}/event/${eventId}`,
      params,
      options
    );
  },
};

export default adminAttendanceApi;
