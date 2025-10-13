import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import Sidebar from './Sidebar';
import Header from './Header';
import DesktopHeader from './DesktopHeader';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

const AppLayout = ({ children, currentPage: propCurrentPage, onPageChange }: AppLayoutProps) => {
  const { user } = useAuth();
  const { navigateToPage, getPageFromPath } = useAppNavigation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine current page based on URL if not provided
  const getCurrentPage = () => {
    if (propCurrentPage) return propCurrentPage;
    
    const path = window.location.pathname;
    if (path.startsWith('/payments')) return 'system-payment';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handlePageChange = (page: string) => {
    if (onPageChange) {
      onPageChange(page);
    } else if (page === 'system-payment') {
      navigateToPage('payments');
    } else {
      navigateToPage(page);
    }
    setIsSidebarOpen(false);
  };

  const handleProfileClick = () => {
    handlePageChange('profile');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Desktop Header - shown when sidebar is closed on desktop */}
      {!isSidebarOpen && (
        <DesktopHeader 
          onMenuClick={handleMenuClick} 
          onProfileClick={handleProfileClick}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-shrink-0">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={handleSidebarClose}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Mobile Header - only shown on mobile/tablet */}
          <div className="flex-shrink-0 lg:hidden">
            <Header onMenuClick={handleMenuClick} />
          </div>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;