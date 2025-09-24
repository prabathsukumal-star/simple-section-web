import { useBackend } from "@/context/BackendContext";
import { useAuth } from "@/context/AuthContext";
import { useApiClient } from "@/lib/api";

// Custom hook to use API with configured backend URL
export const useApi = () => {
  const { backendUrl } = useBackend();
  const { token } = useAuth();
  const apiClient = useApiClient(backendUrl, token);

  // API methods for book hire system
  const api = {
    // Auth
    login: async (email: string, password: string) => {
      if (!apiClient) throw new Error("Backend URL not configured");
      return apiClient.post('/api/bookhire-owner-auth/login', { email, password });
    },

    // Book Hires
    getMyBookHires: async (page = 1, limit = 10) => {
      if (!apiClient) throw new Error("Backend URL not configured");
      return apiClient.get(`/api/bookhires/my-bookhires?page=${page}&limit=${limit}`);
    },

    createBookHire: async (data: any) => {
      if (!apiClient) throw new Error("Backend URL not configured");
      return apiClient.post('/api/bookhires', data);
    },

    // Attendance
    getVehicleAttendance: async (vehicleNumber: string, page = 1, limit = 10) => {
      if (!apiClient) throw new Error("Backend URL not configured");
      return apiClient.get(`/api/bookhire-attendance/vehicle/${vehicleNumber}?page=${page}&limit=${limit}`);
    },

    // Profile
    getOwnerProfile: async () => {
      if (!apiClient) throw new Error("Backend URL not configured");
      return apiClient.get('/api/bookhire-owner-auth/profile');
    },

    // Generic methods for custom endpoints
    get: (endpoint: string) => {
      if (!apiClient) throw new Error("Backend URL not configured");
      return apiClient.get(endpoint);
    },

    post: (endpoint: string, data?: any) => {
      if (!apiClient) throw new Error("Backend URL not configured");
      return apiClient.post(endpoint, data);
    },

    put: (endpoint: string, data?: any) => {
      if (!apiClient) throw new Error("Backend URL not configured");
      return apiClient.put(endpoint, data);
    },

    delete: (endpoint: string) => {
      if (!apiClient) throw new Error("Backend URL not configured");
      return apiClient.delete(endpoint);
    }
  };

  return {
    api,
    backendUrl,
    isConfigured: !!backendUrl
  };
};