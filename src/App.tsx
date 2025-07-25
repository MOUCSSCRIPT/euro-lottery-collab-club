
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useCoinPurchase } from "@/hooks/useCoinPurchase";
import { MandatoryProfileSetup } from "@/components/profile/MandatoryProfileSetup";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmailConfirmation from "./pages/EmailConfirmation";
import Games from "./pages/Games";
import GroupDetails from "./pages/GroupDetails";
import { Admin } from "./pages/Admin";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  useCoinPurchase();
  
  return (
    <MandatoryProfileSetup>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/games" element={<Games />} />
        <Route path="/group/:id" element={<GroupDetails />} />
        <Route path="/admin" element={<Admin />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
