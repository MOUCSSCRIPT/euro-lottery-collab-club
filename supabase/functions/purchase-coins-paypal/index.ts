import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PURCHASE-COINS-PAYPAL] ${step}${detailsStr}`);
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

// Create PayPal order
async function createPayPalOrder(accessToken: string, amount: number, coins: number, origin: string) {
  const orderData = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "EUR",
          value: (amount / 100).toFixed(2), // Convert cents to euros
        },
        description: `Achat de ${coins} SuerteCoins`,
      },
    ],
    application_context: {
      return_url: `${origin}/?purchase=success&provider=paypal`,
      cancel_url: `${origin}/?purchase=cancelled&provider=paypal`,
      brand_name: "Suerte+",
      user_action: "PAY_NOW",
    },
  };

  const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`PayPal order creation failed: ${errorData}`);
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
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { coins } = await req.json();
    if (!coins || coins <= 0) {
      throw new Error("Invalid coins amount");
    }

    // Validate coins amount (must be one of our packages)
    const validPackages = [100, 200, 1000, 2000];
    if (!validPackages.includes(coins)) {
      throw new Error("Invalid coins package");
    }

    // Calculate amount based on package pricing
    const priceMap: Record<number, number> = {
      100: 500,   // 5€ in cents
      200: 1000,  // 10€ in cents  
      1000: 5000, // 50€ in cents
      2000: 10000 // 100€ in cents
    };
    const amount = priceMap[coins];
    logStep("Package validated", { coins, amount });

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    logStep("PayPal access token obtained");

    // Create PayPal order
    const order = await createPayPalOrder(accessToken, amount, coins, req.headers.get("origin") || "");
    logStep("PayPal order created", { orderId: order.id });

    // Record the purchase attempt in our database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from("coin_purchases").insert({
      user_id: user.id,
      stripe_session_id: order.id, // Using this field for PayPal order ID too
      amount,
      coins,
      status: "pending",
    });

    // Find the approval URL
    const approvalUrl = order.links?.find((link: any) => link.rel === "approve")?.href;
    if (!approvalUrl) {
      throw new Error("No approval URL found in PayPal response");
    }

    logStep("PayPal order ready", { orderId: order.id, approvalUrl });

    return new Response(JSON.stringify({ url: approvalUrl, orderId: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in purchase-coins-paypal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});