import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  rightIcon?: React.ComponentType<{ className?: string }>;
  onRightAction?: () => void;
  rightTo?: string;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  backTo,
  rightIcon: RightIcon,
  onRightAction,
  rightTo,
  className,
}) => {
  const navigate = useNavigate();

  return (
    <header className={cn('md:hidden bg-background p-4 pb-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex w-12 items-center">
          {showBack ? (
            backTo ? (
              <Link to={backTo} aria-label="Retour" className="text-foreground">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            ) : (
              <button
                aria-label="Retour"
                onClick={() => navigate(-1)}
                className="text-foreground"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            )
          ) : (
            <span className="inline-block w-6 h-6" />
          )}
        </div>

        <h2 className="flex-1 text-center text-lg font-bold tracking-tight text-foreground">
          {title}
        </h2>

        <div className="flex w-12 items-center justify-end">
          {RightIcon && (
            rightTo ? (
              <Link to={rightTo} aria-label="Action">
                <RightIcon className="h-6 w-6 text-foreground" />
              </Link>
            ) : (
              <button onClick={onRightAction} aria-label="Action">
                <RightIcon className="h-6 w-6 text-foreground" />
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};