import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to compute the effective role based on selected institute's userRole
 * CRITICAL: This ALWAYS uses instituteUserType when an institute is selected
 * Falls back to user's global role ONLY if no institute is selected
 */
export const useEffectiveRole = (): string | undefined => {
  const { user, selectedInstitute, selectedOrganization } = useAuth();

  // Priority 1: Institute-specific role (ALWAYS use this when institute is selected)
  const instituteUserType = selectedInstitute?.instituteUserType || selectedInstitute?.userRole;
  if (instituteUserType) {
    console.log('Using institute-specific role:', instituteUserType);
    // Map backend instituteUserType to app role
    switch (instituteUserType) {
      case 'INSTITUTE_ADMIN':
        return 'InstituteAdmin';
      case 'STUDENT':
        return 'Student';
      case 'TEACHER':
        return 'Teacher';
      case 'ATTENDANCE_MARKER':
        return 'AttendanceMarker';
      case 'PARENT':
        return 'Parent';
      default:
        console.warn('Unknown instituteUserType:', selectedInstitute.userRole);
        return user?.role;
    }
  }

  // Priority 2: Organization role (if organization is selected and no institute)
  if (selectedOrganization?.userRole) {
    return 'OrganizationManager';
  }

  // Priority 3: Global user role (only when no institute/organization is selected)
  console.log('Using global user role:', user?.role);
  return user?.role;
};
