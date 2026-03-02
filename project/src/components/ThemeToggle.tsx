import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';

interface ThemeToggleProps {
  variant?: 'default' | 'icon' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'default',
  size = 'md' 
}) => {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="relative overflow-hidden"
        title={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
      >
        <Sun className={`h-4 w-4 transition-all duration-300 ${
          theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
        }`} />
        <Moon className={`absolute h-4 w-4 transition-all duration-300 ${
          theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
        }`} />
      </Button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-accent transition-colors"
        title={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
      >
        {theme === 'light' ? (
          <Moon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Sun className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleTheme}
      className="flex items-center space-x-2"
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-4 w-4" />
          <span>Mode sombre</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span>Mode clair</span>
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;