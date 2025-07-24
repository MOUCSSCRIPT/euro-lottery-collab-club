import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { ProfileModal } from './ProfileModal';

export const MandatoryProfileSetup = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const [showMandatoryProfile, setShowMandatoryProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !profileLoading && user && !profile) {
      // User is authenticated but has no profile - show mandatory profile creation
      setShowMandatoryProfile(true);
    } else if (!authLoading && !profileLoading && user && profile && (!profile.username || profile.username.trim() === '')) {
      // User has profile but no username - show mandatory profile completion
      setShowMandatoryProfile(true);
    } else {
      setShowMandatoryProfile(false);
    }
  }, [user, profile, authLoading, profileLoading]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      <ProfileModal
        open={showMandatoryProfile}
        onOpenChange={() => {}} // Can't close mandatory modal
        mandatory={true}
      />
    </>
  );
};