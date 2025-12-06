import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="card bg-red-50 border-red-200">
      <div className="flex items-center gap-3">
        <AlertCircle className="text-red-600" size={24} />
        <div className="flex-1">
          <p className="font-medium text-red-900">Error</p>
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary text-sm"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

