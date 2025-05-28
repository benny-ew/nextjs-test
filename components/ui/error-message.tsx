'use client';

import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'card' | 'banner';
  className?: string;
  showIcon?: boolean;
}

export const ErrorMessage = ({
  message,
  onRetry,
  onDismiss,
  variant = 'inline',
  className,
  showIcon = true
}: ErrorMessageProps) => {
  const content = (
    <div className="flex items-start gap-3">
      {showIcon && (
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-700 dark:text-red-400">
          {message}
        </p>
        {(onRetry || onDismiss) && (
          <div className="flex items-center gap-2 mt-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className={cn("border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30", className)}>
        <CardContent className="p-4">
          {content}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        "rounded-md bg-red-50 border border-red-200 p-4 dark:bg-red-950/30 dark:border-red-800",
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn("text-red-600 dark:text-red-400", className)}>
      {content}
    </div>
  );
};
