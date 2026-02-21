import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    // Verify caller identity
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.claims.sub;

    // Verify admin role
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Accès refusé. Admin uniquement." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    if (action === "create") {
      return await handleCreate(supabaseAdmin, params);
    } else if (action === "delete") {
      return await handleDelete(supabaseAdmin, params);
    } else {
      return new Response(JSON.stringify({ error: "Action inconnue" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("admin-manage-players error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleCreate(
  supabaseAdmin: any,
  params: { username: string; email?: string; country?: string }
) {
  const { username, email, country } = params;

  if (!username || username.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Le pseudo est obligatoire" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const cleanUsername = username.trim();
  const capitalizedName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
  const password = `Buenasuerte${capitalizedName}`;
  const userEmail = email?.trim() || `${cleanUsername.toLowerCase().replace(/\s+/g, "")}@suerte.local`;

  // Create user via admin API
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: userEmail,
    password,
    email_confirm: true,
    user_metadata: { username: cleanUsername },
  });

  if (createError) {
    console.error("Create user error:", createError);
    return new Response(
      JSON.stringify({ error: `Erreur création utilisateur: ${createError.message}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Update the profile created by handle_new_user trigger
  const updateData: Record<string, any> = {
    must_change_password: true,
    username: cleanUsername,
  };
  if (country?.trim()) {
    updateData.country = country.trim();
  }

  await supabaseAdmin
    .from("profiles")
    .update(updateData)
    .eq("user_id", newUser.user.id);

  return new Response(
    JSON.stringify({
      success: true,
      user_id: newUser.user.id,
      email: userEmail,
      password,
      username: cleanUsername,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleDelete(
  supabaseAdmin: any,
  params: { user_id: string }
) {
  const { user_id } = params;

  if (!user_id) {
    return new Response(JSON.stringify({ error: "user_id requis" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check for pending grids (user_loto_foot_grids)
  const { data: pendingUserGrids } = await supabaseAdmin
    .from("user_loto_foot_grids")
    .select("id")
    .eq("user_id", user_id)
    .eq("status", "pending")
    .limit(1);

  if (pendingUserGrids && pendingUserGrids.length > 0) {
    return new Response(
      JSON.stringify({
        error: "Impossible de supprimer ce joueur : il a des grilles en cours. Attendez la fin des tirages.",
        code: "PENDING_GRIDS",
      }),
      { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Delete user (cascades to profiles via trigger/FK)
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

  if (deleteError) {
    console.error("Delete user error:", deleteError);
    return new Response(
      JSON.stringify({ error: `Erreur suppression: ${deleteError.message}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
