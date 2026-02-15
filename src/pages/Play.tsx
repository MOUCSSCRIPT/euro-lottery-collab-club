import React, { useEffect } from "react";
import { Header } from "@/components/Header";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { LotoFootPlayGrid } from "@/components/loto-foot/LotoFootPlayGrid";
import { LotoFootCartBadge } from "@/components/cart/LotoFootCartBadge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNextPublishedGrid } from "@/hooks/useNextPublishedGrid";

const Play = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: publishedGrid } = useNextPublishedGrid();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    document.title = "Jouer – Loto Foot 15 | SuertePlus";
    const metaDesc = document.querySelector('meta[name="description"]');
    const content = "Faites vos pronostics sur 15 matchs de football et tentez de gagner. Interface simple et rapide.";
    if (metaDesc) {
      metaDesc.setAttribute("content", content);
    } else {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      m.setAttribute("content", content);
      document.head.appendChild(m);
    }
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 pb-24">
      <div className="hidden md:block">
        <Header />
      </div>
      <div className="md:hidden">
        <MobileHeader
          title="Jouer"
          rightIcon={() => <LotoFootCartBadge onClick={() => navigate("/panier-validation")} />}
        />
      </div>

      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 bg-clip-text text-transparent">
                {publishedGrid?.name || 'Loto Foot 15'}
              </h1>
            </div>

            <LotoFootPlayGrid />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Play;
