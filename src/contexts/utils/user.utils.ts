import { User, UserRole } from '../types/auth.types';

// Updated user type mapping to handle backend enum
export const mapUserTypeToRole = (userType: string): UserRole => {
  const typeMapping: Record<string, UserRole> = {
    'ORGANIZATION_MANAGER': 'OrganizationManager',
    'INSTITUTE_ADMIN': 'InstituteAdmin',
    'STUDENT': 'Student',
    'ATTENDANCE_MARKER': 'AttendanceMarker',
    'ATTEDANCE_MARKER': 'AttendanceMarker',
    'TEACHER': 'Teacher',
    'PARENT': 'Parent',
    'USER': 'User',
    'USER_WITHOUT_PARENT': 'UserWithoutParent',
    'USER_WITHOUT_STUDENT': 'UserWithoutStudent',
    'ORGANIZATIONMANAGER': 'OrganizationManager'
  };
  return typeMapping[userType.toUpperCase()] || 'User';
};

// Helper to get display name from various sources
const getDisplayName = (apiUser: any): string => {
  // Prefer nameWithInitials (new format)
  if (apiUser.nameWithInitials) {
    return apiUser.nameWithInitials;
  }
  // Fallback to firstName + lastName (old format or profile endpoints)
  if (apiUser.firstName && apiUser.lastName) {
    return `${apiUser.firstName} ${apiUser.lastName}`;
  }
  if (apiUser.firstName) {
    return apiUser.firstName;
  }
  return 'User';
};

export const mapUserData = (apiUser: any, institutes: any[] = []): User => ({
  id: apiUser.id,
  firstName: apiUser.firstName || '',
  lastName: apiUser.lastName || '',
  nameWithInitials: apiUser.nameWithInitials || '',
  name: getDisplayName(apiUser),
  email: apiUser.email,
  phone: apiUser.phone || '',
  userType: apiUser.userType,
  dateOfBirth: apiUser.dateOfBirth || '',
  gender: apiUser.gender || '',
  nic: apiUser.nic || '',
  birthCertificateNo: apiUser.birthCertificateNo || '',
  addressLine1: apiUser.addressLine1 || '',
  addressLine2: apiUser.addressLine2 || '',
  city: apiUser.city || '',
  district: apiUser.district || '',
  province: apiUser.province || '',
  postalCode: apiUser.postalCode || '',
  country: apiUser.country || '',
  isActive: apiUser.isActive || true,
  createdAt: apiUser.createdAt || '',
  updatedAt: apiUser.updatedAt || '',
  imageUrl: apiUser.imageUrl || '',
  role: mapUserTypeToRole(apiUser.userType),
  institutes: institutes
});
