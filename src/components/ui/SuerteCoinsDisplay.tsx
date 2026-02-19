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
    default: 'text-accent bg-accent/10 border-accent/30',
    success: 'text-success bg-success/10 border-success/30',
    warning: 'text-accent bg-accent/10 border-accent/30',
    error: 'text-destructive bg-destructive/10 border-destructive/30'
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
