import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'network' | 'notFound';
  actionLabel?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  type = 'error',
  actionLabel = 'Retry'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="h-12 w-12 text-muted-foreground" />;
      case 'notFound':
        return <AlertCircle className="h-12 w-12 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-12 w-12 text-destructive" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'network':
        return 'Connection issue';
      case 'notFound':
        return 'Not found';
      default:
        return 'Something went wrong';
    }
  };

  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        {getIcon()}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {title || getDefaultTitle()}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {message}
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ErrorState;