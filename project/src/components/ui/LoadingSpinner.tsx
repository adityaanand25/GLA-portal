import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: number;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = false, 
  size = 24, 
  color = 'text-blue-600' 
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <Loader2 className={`animate-spin ${color}`} size={size} />
      </div>
    );
  }

  return <Loader2 className={`animate-spin ${color}`} size={size} />;
};

export default LoadingSpinner;