import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PURCHASE-PAYPAL] ${step}${detailsStr}`);
};

// Get PayPal access token
async function getPayPalAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Accept-Language": "en_US",
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Capture PayPal payment
async function capturePayPalPayment(accessToken: string, orderId: string) {
  const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`PayPal capture failed: ${errorData}`);
  }

  return await response.json();
}

// Get PayPal order details
async function getPayPalOrderDetails(accessToken: string, orderId: string) {
  const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`PayPal order details failed: ${errorData}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) {
      throw new Error("User not authenticated");
    }
    logStep("User authenticated", { userId: user.id });

    const { orderId } = await req.json();
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    logStep("PayPal access token obtained");

    // Get order details first
    const orderDetails = await getPayPalOrderDetails(accessToken, orderId);
    logStep("PayPal order details retrieved", { status: orderDetails.status });

    // Use service role to update database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the purchase record to find the coins amount
    const { data: purchase } = await supabaseService
      .from("coin_purchases")
      .select("coins, user_id")
      .eq("stripe_session_id", orderId) // We're using this field for PayPal order ID
      .single();

    if (!purchase || purchase.user_id !== user.id) {
      throw new Error("Purchase record not found or user mismatch");
    }

    const coins = purchase.coins;

    if (orderDetails.status === "APPROVED") {
      // Capture the payment
      const captureResult = await capturePayPalPayment(accessToken, orderId);
      logStep("PayPal payment captured", { captureId: captureResult.id });

      if (captureResult.status === "COMPLETED") {
        // Update purchase status
        await supabaseService
          .from("coin_purchases")
          .update({ status: "completed" })
          .eq("stripe_session_id", orderId);

        // Add coins to user profile
        const { data: currentProfile } = await supabaseService
          .from("profiles")
          .select("coins")
          .eq("user_id", user.id)
          .single();

        if (currentProfile) {
          const newCoinsTotal = (currentProfile.coins || 0) + coins;
          await supabaseService
            .from("profiles")
            .update({ 
              coins: newCoinsTotal,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);

          logStep("Coins added to user profile", { coins, newTotal: newCoinsTotal });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          coins,
          message: `${coins} SuerteCoins ajoutés à votre compte !`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        return new Response(JSON.stringify({ 
          success: false, 
          message: "Paiement PayPal non complété"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Commande PayPal non approuvée"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-coin-purchase-paypal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});