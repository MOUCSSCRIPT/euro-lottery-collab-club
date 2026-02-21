import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { ProfileModal } from './ProfileModal';
import { ForcePasswordChange } from './ForcePasswordChange';

export const MandatoryProfileSetup = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const [showMandatoryProfile, setShowMandatoryProfile] = useState(false);
  const [showForcePassword, setShowForcePassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !profileLoading && user && profile) {
      if (profile.must_change_password) {
        setShowForcePassword(true);
        setShowMandatoryProfile(false);
      } else if (!profile.username || profile.username.trim() === '') {
        setShowMandatoryProfile(true);
        setShowForcePassword(false);
      } else {
        setShowMandatoryProfile(false);
        setShowForcePassword(false);
      }
    } else if (!authLoading && !profileLoading && user && !profile) {
      setShowMandatoryProfile(true);
      setShowForcePassword(false);
    } else {
      setShowMandatoryProfile(false);
      setShowForcePassword(false);
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
      <ForcePasswordChange open={showForcePassword} />
      <ProfileModal
        open={showMandatoryProfile}
        onOpenChange={() => {}}
        mandatory={true}
      />
    </>
  );
};