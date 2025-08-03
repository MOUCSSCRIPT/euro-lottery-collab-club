import React from 'react';
import { Header } from '@/components/Header';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <div className="container mx-auto px-4 pt-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Mon Profil</h1>
          
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <p className="text-muted-foreground text-center">
              Page de profil en cours de développement...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;