import React from 'react';
import { SuerteCoinsIcon } from './SuerteCoinsIcon';
import { cn } from '@/lib/utils';

interface SuerteCoinsDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const SuerteCoinsDisplay = ({ 
  amount, 
  size = 'md', 
  variant = 'default',
  showLabel = false,
  className,
  onClick,
  clickable = false
}: SuerteCoinsDisplayProps) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const variantClasses = {
    default: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-orange-600 bg-orange-50 border-orange-200',
    error: 'text-red-600 bg-red-50 border-red-200'
  };

  const Component = clickable ? 'button' : 'div';

  return (
    <Component 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium",
        sizeClasses[size],
        variantClasses[variant],
        clickable && "cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-md",
        className
      )}
      onClick={clickable ? onClick : undefined}
      type={clickable ? "button" : undefined}
    >
      <SuerteCoinsIcon 
        size={iconSizes[size]} 
        className="flex-shrink-0"
      />
      <span className="font-bold">{amount.toFixed(1)}</span>
      {showLabel && (
        <span className="text-xs opacity-80">SuerteCoins</span>
      )}
    </Component>
  );
};