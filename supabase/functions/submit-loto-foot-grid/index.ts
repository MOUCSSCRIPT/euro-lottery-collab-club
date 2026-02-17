import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function normalizePredictions(predictions: Record<string, string[]>): string {
  const sorted = Object.keys(predictions)
    .sort()
    .reduce((acc: Record<string, string[]>, key: string) => {
      acc[key] = [...predictions[key]].sort();
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

function countCombinations(predictions: Record<string, string[]>): number {
  return Object.values(predictions).reduce(
    (total, preds) => total * (preds.length || 1),
    1
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non authentifié" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Non authentifié" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { predictions, draw_date } = await req.json();

    if (!predictions || !draw_date) {
      return new Response(
        JSON.stringify({ error: "Paramètres manquants (predictions, draw_date)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate cost = number of combinations
    const cost = countCombinations(predictions);

    // 1. Anti-duplicate check: compare normalized predictions against ALL grids for same draw_date
    const { data: existingGrids, error: fetchError } = await supabaseAdmin
      .from("user_loto_foot_grids")
      .select("predictions")
      .eq("draw_date", draw_date)
      .eq("instance_index", 1); // Only check first instance to avoid self-duplicates

    if (fetchError) throw fetchError;

    const normalizedNew = normalizePredictions(predictions);
    const isDuplicate = existingGrids?.some((g: any) => {
      try {
        return normalizePredictions(g.predictions) === normalizedNew;
      } catch {
        return false;
      }
    });

    if (isDuplicate) {
      return new Response(
        JSON.stringify({
          error: "Cette combinaison existe déjà. Veuillez modifier vos choix.",
          code: "DUPLICATE_GRID",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check user balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("coins")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profil introuvable" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.coins < cost) {
      return new Response(
        JSON.stringify({
          error: `SuerteCoins insuffisants. Vous avez ${profile.coins} SC, il en faut ${cost}.`,
          code: "INSUFFICIENT_COINS",
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Generate group_grid_id and insert N rows
    const groupGridId = crypto.randomUUID();
    const rows = [];
    for (let i = 1; i <= cost; i++) {
      rows.push({
        user_id: user.id,
        draw_date,
        predictions,
        cost: 1,
        stake: 1,
        potential_winnings: 0,
        status: "pending",
        instance_index: i,
        group_grid_id: groupGridId,
      });
    }

    const { error: insertError } = await supabaseAdmin
      .from("user_loto_foot_grids")
      .insert(rows);

    if (insertError) throw insertError;

    // 4. Deduct coins
    const { error: coinError } = await supabaseAdmin
      .from("profiles")
      .update({ coins: profile.coins - cost })
      .eq("user_id", user.id);

    if (coinError) throw coinError;

    return new Response(
      JSON.stringify({
        success: true,
        grids_created: cost,
        group_grid_id: groupGridId,
        cost,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("submit-loto-foot-grid error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
