import React from 'react';
import { CalendarCheck, Bus, ArrowLeft, MapPin, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppNavigation } from '@/hooks/useAppNavigation';

interface TransportSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onBackToTransport: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    id: 'attendance',
    title: 'Attendance',
    description: 'Mark and view attendance',
    icon: CalendarCheck,
    route: 'transport-attendance',
  },
  {
    id: 'details',
    title: 'Transport Info',
    description: 'View transport details',
    icon: MapPin,
    route: 'transport-info',
  },
];

export function TransportSidebar({ activeView, setActiveView, onBackToTransport, isOpen, onClose }: TransportSidebarProps) {
  const { navigateToPage } = useAppNavigation();

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    setActiveView(item.id);
    navigateToPage(item.route);
    onClose();
  };

  const SidebarSection = ({ title, items }: { title: string; items: any[] }) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4 sm:mb-6">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {items.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start h-9 sm:h-10 px-3 text-sm ${
                activeView === item.id 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-r-2 border-blue-600' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleMenuItemClick(item)}
            >
              <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
              {item.title}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 md:relative
        w-72 sm:w-80 md:w-64 lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out md:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-screen
        overflow-hidden
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 min-w-0">
            <Bus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
              Transport
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close Sidebar"
            >
              <X className="h-4 w-4 md:hidden" />
              <Menu className="h-4 w-4 hidden md:block" />
            </Button>
          </div>
        </div>

        {/* Context Info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Management Hub
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToTransport}
              className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
              aria-label="Back to Transport"
            >
              <ArrowLeft className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            <span className="font-medium">Module:</span> 
            <span className="ml-1 truncate">Transport System</span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
          <div className="space-y-2">
            {/* Main navigation items */}
            <SidebarSection title="Quick Access" items={menuItems} />
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToTransport}
            className="w-full flex items-center justify-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 h-8 sm:h-9"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Back to Transport</span>
          </Button>
        </div>
      </div>
    </>
  );
}