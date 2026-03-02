import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import lightLogo from '../assets/untitled_(rectangle_sticker_(landscape))_(1).png';
import darkLogo from '../assets/untitled_(rectangle_sticker_(landscape)).png';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme } = useTheme();

  return (
    <img
      src={theme === 'light' ? lightLogo : darkLogo}
      alt="Dealio"
      className={className}
    />
  );
};

export default Logo;
