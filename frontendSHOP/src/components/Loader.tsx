import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-primary/30 border-t-primary rounded-full animate-spin`}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Chargement...' }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader size="lg" text={text} />
    </div>
  );
};

export default Loader;
