/**
 * User Profile API
 * Endpoints: GET /users/profile, PATCH /users/profile, POST /users/:id/profile-image
 */

import { apiClient } from './client';
import { 
  UserProfileResponse, 
  UpdateProfileRequest 
} from '@/types/userProfile.types';

/**
 * Clean profile update data before sending to API
 * - Removes email and phoneNumber (they are masked and shouldn't be sent)
 * - Removes addressLine2 if empty
 * - Removes empty string values
 */
const cleanProfileUpdateData = (data: UpdateProfileRequest): UpdateProfileRequest => {
  const cleanData: Record<string, unknown> = {};
  
  // List of fields to always exclude (read-only or masked)
  const excludeFields = ['email', 'phoneNumber', 'id', 'userType', 'isActive', 'createdAt', 'updatedAt'];
  
  Object.entries(data).forEach(([key, value]) => {
    // Skip excluded fields
    if (excludeFields.includes(key)) {
      return;
    }
    
    // Skip empty strings, null, and undefined
    if (value === '' || value === null || value === undefined) {
      return;
    }
    
    // Special handling for addressLine2 - skip if empty or whitespace only
    if (key === 'addressLine2' && typeof value === 'string' && value.trim() === '') {
      return;
    }
    
    cleanData[key] = value;
  });
  
  return cleanData as UpdateProfileRequest;
};

/**
 * Validate profile data before sending
 */
export const validateProfileData = (data: UpdateProfileRequest): string[] => {
  const errors: string[] = [];

  // NIC validation (Sri Lankan format)
  if (data.nic && !/^(\d{9}[VvXx]|\d{12})$/.test(data.nic)) {
    errors.push('NIC must be in format 123456789V or 200012345678');
  }

  // Date of birth validation
  if (data.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth)) {
    errors.push('Date of birth must be in yyyy-MM-dd format');
  }

  // Phone number validation (emergency contact)
  if (data.emergencyContact && !/^\+?\d{10,15}$/.test(data.emergencyContact)) {
    errors.push('Emergency contact must be 10-15 digits');
  }

  // Postal code validation
  if (data.postalCode && !/^\d{5,6}$/.test(data.postalCode)) {
    errors.push('Postal code must be 5-6 digits');
  }

  // String length validations
  if (data.addressLine1 && data.addressLine1.length > 200) {
    errors.push('Address line 1 must be max 200 characters');
  }

  if (data.addressLine2 && data.addressLine2.length > 200) {
    errors.push('Address line 2 must be max 200 characters');
  }

  if (data.city && data.city.length > 50) {
    errors.push('City must be max 50 characters');
  }

  if (data.nic && data.nic.length > 12) {
    errors.push('NIC must be max 12 characters');
  }

  if (data.birthCertificateNo && data.birthCertificateNo.length > 50) {
    errors.push('Birth certificate number must be max 50 characters');
  }

  if (data.occupation && data.occupation.length > 100) {
    errors.push('Occupation must be max 100 characters');
  }

  if (data.workplace && data.workplace.length > 100) {
    errors.push('Workplace must be max 100 characters');
  }

  return errors;
};

export const userProfileApi = {
  /**
   * Get current user's profile
   * Endpoint: GET /users/profile
   */
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>('/users/profile');
    return response;
  },

  /**
   * Update current user's profile
   * Endpoint: PATCH /users/profile
   * 
   * IMPORTANT: 
   * - Do NOT send email and phoneNumber (they are masked in responses)
   * - Do NOT send addressLine2 unless user explicitly filled it
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    // Validate before sending
    const errors = validateProfileData(data);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    // Clean data before sending
    const cleanedData = cleanProfileUpdateData(data);
    
    const response = await apiClient.patch<UserProfileResponse>('/users/profile', cleanedData);
    return response;
  },

  /**
   * Update user's profile image
   * Endpoint: POST /users/:id/profile-image
   * 
   * Note: This is called after the 4-step signed URL upload workflow completes
   */
  updateProfileImage: async (userId: string, imageUrl: string): Promise<{ success: boolean; imageUrl: string }> => {
    const response = await apiClient.post<{ success: boolean; data: { imageUrl: string } }>(
      `/users/${userId}/profile-image`,
      { imageUrl }
    );
    return { success: true, imageUrl: response.data?.imageUrl || imageUrl };
  }
};
