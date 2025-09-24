
import { useCallback } from 'react';

export const useAppNavigation = () => {
  // Router-agnostic navigation that works even before Router is ready
  const navigateToPage = useCallback((page: string) => {
    console.log('Navigating to page:', page);
    
    const routeMap: Record<string, string> = {
      'dashboard': '/',
      'institutes': '/institutes',
      'institute-users': '/institutes/users', 
      'institute-classes': '/institutes/classes',
      'organizations': '/organizations',
      'profile': '/profile',
      'users': '/users',
      'students': '/students',
      'teachers': '/teachers',
      'parents': '/parents',
      'classes': '/classes',
      'subjects': '/subjects',
      'grades': '/grades',
      'grading': '/grading',
      'attendance': '/attendance',
      'my-attendance': '/my-attendance',
      'daily-attendance': '/daily-attendance',
      
      'attendance-markers': '/attendance-markers',
      'qr-attendance': '/qr-attendance',
      'lectures': '/lectures',
      'live-lectures': '/live-lectures',
      'homework': '/homework',
      'homework-submissions': '/homework-submissions',
      'exams': '/exams',
      'results': '/results',
      'select-institute': '/select-institute',
      'select-class': '/select-class',
      'select-subject': '/select-subject',
      'parent-children': '/parent-children',
      'teacher-students': '/teacher-students',
      'teacher-homework': '/teacher-homework',
      'teacher-exams': '/teacher-exams',
      'teacher-lectures': '/teacher-lectures',
      'institute-lectures': '/institute-lectures',
      'settings': '/settings',
      'appearance': '/appearance',
      'institute-details': '/institute-details',
      'gallery': '/gallery',
      'institute-payments': '/institute-payments',
      'subject-payments': '/subject-payments',
      'subject-pay-submission': '/subject-pay-submission',
      'unverified-students': '/unverified-students',
      'enroll-class': '/enroll-class',
      'enroll-subject': '/enroll-subject',
      'child-attendance': '/child-attendance',
      'child-results': '/child-results',
      'free-lectures': '/free-lectures',
      'transport': '/transport',
      'student-transport': '/student-transport',
      'parent-transport': '/parent-transport',
      'transport-selection': '/transport-selection',
      'transport-attendance': '/transport-attendance',
      'transport-info': '/transport-info'
    };
    
    const route = routeMap[page] || `/${page}`;
    try {
      // Prefer history API without reload
      window.history.pushState({}, '', route);
      // Notify listeners that rely on pathname
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (e) {
      // Fallback
      window.location.assign(route);
    }
  }, []);

  const getPageFromPath = useCallback((pathname: string): string => {
    if (pathname === '/') return 'dashboard';
    if (pathname === '/institutes/users') return 'institute-users';
    if (pathname === '/institutes/classes') return 'institute-classes';
    if (pathname === '/subject-pay-submission') return 'subject-pay-submission';
    return pathname.replace(/^\//, '');
  }, []);

  return {
    navigateToPage,
    getPageFromPath
  };
};
