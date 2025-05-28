'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className,
  text 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 
        data-testid="loading-spinner"
        className={cn(
          "animate-spin text-blue-600",
          sizeClasses[size]
        )} 
      />
      {text && (
        <span className="ml-2 text-sm text-gray-600">
          {text}
        </span>
      )}
    </div>
  );
};
