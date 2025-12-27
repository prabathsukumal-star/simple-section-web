const BASE_URL = "https://lmsapi.suraksha.lk";

export const getAuthToken = () => localStorage.getItem("access_token");

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Include server error message when available
    let details = "";
    try {
      const text = await response.text();
      details = text;
      try {
        const parsed = JSON.parse(text);
        const msg = parsed?.message || parsed?.details?.message || parsed?.error;
        if (typeof msg === "string" && msg.trim()) {
          throw new Error(msg);
        }
      } catch {
        // not JSON
      }
    } catch {
      // ignore
    }

    throw new Error(
      details?.trim()
        ? `API Error: ${response.status} - ${details}`
        : `API Error: ${response.status}`
    );
  }

  // Some endpoints may return 204
  if (response.status === 204) return null;

  return response.json();
};

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest("/v2/auth/login", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }),

  // Users
  getUsers: (page = 1, limit = 10, isActive = true) =>
    apiRequest(`/users?page=${page}&limit=${limit}&isActive=${isActive}`),

  // Institutes
  getInstitutes: (page = 1, limit = 10, isActive = true) =>
    apiRequest(`/institutes?page=${page}&limit=${limit}&search=&instituteType=&isActive=${isActive}`),

  createInstitute: (data: any) =>
    apiRequest("/institutes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Subjects
  getSubjects: (page = 1, limit = 10) =>
    apiRequest(`/subjects/all?page=${page}&limit=${limit}`),

  createSubject: (data: any) =>
    apiRequest("/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // System Payments
  getPayments: (page = 1, limit = 10) =>
    apiRequest(`/payment?page=${page}&limit=${limit}`),

  verifyPayment: (paymentId: string, data: {
    status: string;
    subscriptionPlan: string;
    paymentValidityDays: number;
    notes: string;
  }) =>
    apiRequest(`/payment/${paymentId}/verify`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // SMS Payments
  getSMSPayments: (page = 1, limit = 10) =>
    apiRequest(`/sms/admin/verifications/pending?page=${page}&limit=${limit}`),

  verifySMSPayment: (submissionId: string, data: {
    action: string;
    creditsToGrant: number;
    adminNotes: string;
  }) =>
    apiRequest(`/sms/admin/verifications/${submissionId}/verify`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // SMS Approvals
  getSMSApprovals: (page = 1, limit = 10) =>
    apiRequest(`/sms/admin/pending-approvals?page=${page}&limit=${limit}`),

  approveSMSCampaign: (messageId: string, data: { adminNotes: string }) =>
    apiRequest(`/sms/admin/campaigns/${messageId}/approve`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  rejectSMSCampaign: (messageId: string, data: { rejectionReason: string; adminNotes: string }) =>
    apiRequest(`/sms/admin/campaigns/${messageId}/reject`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // File Upload
  getSignedUrl: (folder: string, fileName: string, contentType: string, fileSize: number) =>
    apiRequest(`/upload/get-signed-url?folder=${encodeURIComponent(folder)}&fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}&fileSize=${fileSize}`, {
      method: "GET",
    }),

  verifyAndPublish: (relativePath: string) =>
    apiRequest("/upload/verify-and-publish", {
      method: "POST",
      body: JSON.stringify({ relativePath }),
    }),

  // Institute Users
  assignUserToInstitute: (instituteId: string, data: {
    userId: string;
    instituteUserType: string;
    userIdByInstitute: string;
    instituteCardId?: string;
    instituteImage?: string;
  }) =>
    apiRequest(`/institute-users/institute/${instituteId}/assign-user-by-id`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // User RFID
  registerRfid: (userId: string, userRfid: string) =>
    apiRequest("/users/register-rfid", {
      method: "POST",
      body: JSON.stringify({ userId, userRfid }),
    }),

  // User Activate/Deactivate
  deactivateUser: (userId: string) =>
    apiRequest(`/users/${userId}/deactivate`, {
      method: "PATCH",
    }),

  activateUser: (userId: string) =>
    apiRequest(`/users/${userId}/activate`, {
      method: "PATCH",
    }),

  // SMS Sender Masks
  createSenderMask: (data: {
    instituteId: string;
    maskId: string;
    displayName: string;
    phoneNumber: string;
    isActive: boolean;
  }) =>
    apiRequest("/sms/sender-masks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSenderMasks: (instituteId: string) =>
    apiRequest(`/sms/sender-masks?instituteId=${instituteId}`),

  // Advertisements
  getAdvertisements: (page = 1, limit = 10) =>
    apiRequest(`/api/advertisements?page=${page}&limit=${limit}`),

  createAdvertisement: (data: any) =>
    apiRequest("/api/advertisements", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Organizations
  getOrganizations: (params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", String(params.page));
    if (params.limit) queryParams.append("limit", String(params.limit));
    if (params.search) queryParams.append("search", params.search);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    return apiRequest(`/organizations?${queryParams.toString()}`);
  },

  getOrganizationById: (id: string) =>
    apiRequest(`/organizations/${id}`),

  createOrganization: (data: {
    name: string;
    type: string;
    isPublic?: boolean;
    enrollmentKey?: string;
    needEnrollmentVerification?: boolean;
    enabledEnrollments?: boolean;
    imageUrl?: string;
    instituteId?: string;
  }) =>
    apiRequest("/organizations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateOrganization: (id: string, data: {
    name?: string;
    isPublic?: boolean;
    enrollmentKey?: string;
    needEnrollmentVerification?: boolean;
    enabledEnrollments?: boolean;
    imageUrl?: string;
    instituteId?: string;
  }) =>
    apiRequest(`/organizations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteOrganization: (id: string) =>
    apiRequest(`/organizations/${id}`, {
      method: "DELETE",
    }),

  // Organization Members
  getOrganizationMembers: (id: string, page = 1, limit = 50) =>
    apiRequest(`/organizations/${id}/members?page=${page}&limit=${limit}`),

  getUnverifiedMembers: (id: string) =>
    apiRequest(`/organizations/${id}/members/unverified`),

  verifyMember: (id: string, userId: string) =>
    apiRequest(`/organizations/${id}/verify`, {
      method: "PUT",
      body: JSON.stringify({ userId }),
    }),

  // Organization Management
  assignRole: (id: string, data: { userId: string; role: string }) =>
    apiRequest(`/organizations/${id}/management/assign-role`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  changeRole: (id: string, data: { userId: string; newRole: string }) =>
    apiRequest(`/organizations/${id}/management/change-role`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  removeUserFromOrganization: (id: string, userId: string) =>
    apiRequest(`/organizations/${id}/management/remove-user`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    }),

  transferPresidency: (id: string, newPresidentUserId: string) =>
    apiRequest(`/organizations/${id}/management/transfer-presidency`, {
      method: "PUT",
      body: JSON.stringify({ newPresidentUserId }),
    }),

  // Enrollment
  enrollInOrganization: (data: { organizationId: string; enrollmentKey?: string }) =>
    apiRequest("/organizations/enroll", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  leaveOrganization: (id: string) =>
    apiRequest(`/organizations/${id}/leave`, {
      method: "DELETE",
    }),

  getUserEnrolledOrganizations: (page = 1, limit = 10) =>
    apiRequest(`/organizations/user/enrolled?page=${page}&limit=${limit}`),

  getUserNotEnrolledOrganizations: (page = 1, limit = 10) =>
    apiRequest(`/organizations/user/not-enrolled?page=${page}&limit=${limit}`),

  // Institute Operations for Organizations
  assignInstituteToOrganization: (id: string, instituteId: string) =>
    apiRequest(`/organizations/${id}/assign-institute`, {
      method: "PUT",
      body: JSON.stringify({ instituteId }),
    }),

  removeInstituteFromOrganization: (id: string) =>
    apiRequest(`/organizations/${id}/remove-institute`, {
      method: "DELETE",
    }),

  getOrganizationsByInstitute: (instituteId: string, page = 1, limit = 10) =>
    apiRequest(`/organizations/institute/${instituteId}?page=${page}&limit=${limit}`),

  getAvailableInstitutesForOrg: () =>
    apiRequest("/organizations/institutes/available"),

  // Institute Update
  updateInstitute: (id: string, data: any) =>
    apiRequest(`/institutes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Subject Update
  updateSubject: (id: string, data: any) =>
    apiRequest(`/subjects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Structured Lectures
  getStructuredLectures: (page = 1, limit = 10) =>
    apiRequest(`/api/structured-lectures?page=${page}&limit=${limit}`),

  createStructuredLecture: (data: any) =>
    apiRequest("/api/structured-lectures", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
