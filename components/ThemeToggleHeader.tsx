'use client';

import { ThemeToggle } from '@/components/theme-toggle';

interface ThemeToggleHeaderProps {
  className?: string;
}

export function ThemeToggleHeader({ className = '' }: ThemeToggleHeaderProps) {
  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="p-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-md">
        <ThemeToggle />
      </div>
    </div>
  );
}
