import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Cartesian product: expand multi-choice predictions into individual single-choice grids.
 * Input:  { "m1": ["X","2"], "m2": ["X"], "m3": ["1"] }
 * Output: [
 *   { "m1": "X", "m2": "X", "m3": "1" },
 *   { "m1": "2", "m2": "X", "m3": "1" }
 * ]
 */
function expandCombinations(
  predictions: Record<string, string[]>
): Record<string, string>[] {
  const matchIds = Object.keys(predictions).sort();
  let combos: Record<string, string>[] = [{}];

  for (const matchId of matchIds) {
    const choices = predictions[matchId];
    const newCombos: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const choice of choices) {
        newCombos.push({ ...combo, [matchId]: choice });
      }
    }
    combos = newCombos;
  }
  return combos;
}

/**
 * Normalize a single-choice prediction object for reliable comparison.
 * Keys are sorted alphabetically.
 */
function normalizeSinglePrediction(pred: Record<string, string>): string {
  const sorted = Object.keys(pred)
    .sort()
    .reduce((acc: Record<string, string>, key: string) => {
      acc[key] = pred[key];
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

/**
 * Normalize an existing DB row's predictions to a single-choice string for comparison.
 * Handles both legacy format (values are arrays) and new format (values are strings).
 */
function normalizeExistingPrediction(pred: Record<string, unknown>): string {
  const sorted = Object.keys(pred)
    .sort()
    .reduce((acc: Record<string, string>, key: string) => {
      const val = pred[key];
      // New format: string value directly
      if (typeof val === "string") {
        acc[key] = val;
      }
      // Legacy format: array with single element
      else if (Array.isArray(val) && val.length === 1) {
        acc[key] = val[0];
      }
      // Legacy format with multiple choices — not a single combo, skip
      else {
        acc[key] = JSON.stringify(val);
      }
      return acc;
    }, {});
  return JSON.stringify(sorted);
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

    // 1. Expand predictions into individual combinations (Cartesian product)
    const expandedCombos = expandCombinations(predictions);
    const cost = expandedCombos.length;

    // 2. Fetch ALL existing single-combo grids for this draw date (all players)
    const { data: existingGrids, error: fetchError } = await supabaseAdmin
      .from("user_loto_foot_grids")
      .select("predictions")
      .eq("draw_date", draw_date);

    if (fetchError) throw fetchError;

    // Build a Set of normalized existing predictions for fast lookup
    const existingSet = new Set<string>();
    if (existingGrids) {
      for (const g of existingGrids) {
        try {
          existingSet.add(normalizeExistingPrediction(g.predictions as Record<string, unknown>));
        } catch {
          // Skip malformed rows
        }
      }
    }

    // 3. Check each expanded combo for duplicates
    for (const combo of expandedCombos) {
      const normalized = normalizeSinglePrediction(combo);
      if (existingSet.has(normalized)) {
        return new Response(
          JSON.stringify({
            error: "Une ou plusieurs combinaisons générées existent déjà. Veuillez modifier vos choix.",
            code: "DUPLICATE_GRID",
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 4. Check user balance
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

    // 5. Insert each expanded combination as a separate row
    const groupGridId = crypto.randomUUID();
    const rows = expandedCombos.map((combo, i) => ({
      user_id: user.id,
      draw_date,
      predictions: combo, // single-choice object: {"m1":"X", "m2":"1", ...}
      cost: 1,
      stake: 1,
      potential_winnings: 0,
      status: "pending",
      instance_index: i + 1,
      group_grid_id: groupGridId,
    }));

    const { error: insertError } = await supabaseAdmin
      .from("user_loto_foot_grids")
      .insert(rows);

    if (insertError) throw insertError;

    // 6. Deduct coins
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
