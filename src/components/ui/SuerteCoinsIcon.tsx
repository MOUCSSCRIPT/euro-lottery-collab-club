import React from 'react';
import { LucideProps } from 'lucide-react';

interface SuerteCoinsIconProps extends Omit<LucideProps, 'ref'> {
  className?: string;
}

export const SuerteCoinsIcon = ({ 
  size = 24, 
  className = "", 
  color = "currentColor",
  ...props 
}: SuerteCoinsIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`suerte-coins-icon ${className}`}
      {...props}
    >
      {/* Coin avec étoile au centre pour représenter la "suerte" (chance) */}
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="9" />
      
      {/* Étoile de la chance au centre */}
      <path d="M12 2 L15 9 L22 9 L17 14 L19 22 L12 18 L5 22 L7 14 L2 9 L9 9 Z" 
            fill="currentColor" 
            fillOpacity="0.8" 
            strokeWidth="1" />
      
      {/* Petites étoiles autour pour l'effet "chance" */}
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
      <circle cx="18" cy="18" r="1" fill="currentColor" />
    </svg>
  );
};