
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useCoinPurchase } from "@/hooks/useCoinPurchase";
import { MandatoryProfileSetup } from "@/components/profile/MandatoryProfileSetup";
import { MobileNavBar } from "@/components/layout/MobileNavBar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmailConfirmation from "./pages/EmailConfirmation";
import Games from "./pages/Games";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import GroupDetails from "./pages/GroupDetails";
import Groups from "./pages/Groups";
import PlayerStats from "./pages/PlayerStats";
import { Admin } from "./pages/Admin";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  useCoinPurchase();
  
  return (
    <MandatoryProfileSetup>
      <div className="pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/games" element={<Games />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/stats" element={<PlayerStats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/panier" element={<Cart />} />
          <Route path="/group/:id" element={<GroupDetails />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <MobileNavBar />
    </MandatoryProfileSetup>
  );
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
