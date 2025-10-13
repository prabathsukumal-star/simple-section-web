import { Button } from '@/components/ui/button';
import { Menu, Moon, Sun, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';

interface DesktopHeaderProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

const DesktopHeader = ({ onMenuClick, onProfileClick }: DesktopHeaderProps) => {
  const { selectedInstitute } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Left Section - Menu and Logo */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="h-10 w-10 p-0"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {selectedInstitute?.logo && (
          <img 
            src={selectedInstitute.logo} 
            alt="Institute logo"
            className="h-10 w-10 object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        <span className="font-bold text-lg text-gray-900 dark:text-white">
          {selectedInstitute?.name || 'SurakshaLMS'}
        </span>
      </div>

      {/* Right Section - Theme Toggle and Profile */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-10 w-10 p-0"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onProfileClick}
          className="h-10 w-10 p-0"
          aria-label="User Profile"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default DesktopHeader;
