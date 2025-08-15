import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParionsSportMatch {
  homeTeam: string;
  awayTeam: string;
  matchDateTime: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  competition?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drawDate } = await req.json();

    if (!drawDate) {
      return new Response(
        JSON.stringify({ error: 'Date du tirage manquante' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Fetching ParionsSport matches for draw date: ${drawDate}`);

    // Pour le moment, nous simulons la récupération depuis ParionsSport
    // Dans un vrai scénario, vous feriez un appel à leur API
    const mockMatches: ParionsSportMatch[] = await fetchParionsSportMatches(drawDate);

    // Vérifier si des matchs existent déjà pour cette date
    const { data: existingMatches } = await supabase
      .from('loto_foot_matches')
      .select('match_position')
      .eq('draw_date', drawDate);

    const existingPositions = new Set(existingMatches?.map(m => m.match_position) || []);

    // Préparer les données pour insertion
    const matchesToInsert = mockMatches
      .map((match, index) => ({
        home_team: match.homeTeam,
        away_team: match.awayTeam,
        match_datetime: match.matchDateTime,
        match_position: index + 1,
        draw_date: drawDate,
        home_odds: match.homeOdds,
        draw_odds: match.drawOdds,
        away_odds: match.awayOdds,
        status: 'scheduled' as const
      }))
      .filter(match => !existingPositions.has(match.match_position));

    if (matchesToInsert.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'Tous les matchs sont déjà configurés pour cette date',
          insertedCount: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insérer les nouveaux matchs
    const { data, error } = await supabase
      .from('loto_foot_matches')
      .insert(matchesToInsert)
      .select();

    if (error) {
      console.error('Error inserting matches:', error);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'insertion des matchs' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Successfully inserted ${data.length} matches`);

    return new Response(
      JSON.stringify({ 
        message: `${data.length} matchs récupérés et ajoutés avec succès`,
        insertedCount: data.length,
        matches: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Fonction simulant la récupération des matchs depuis ParionsSport
async function fetchParionsSportMatches(drawDate: string): Promise<ParionsSportMatch[]> {
  // Simulation de données - dans un vrai scénario, vous feriez un appel à l'API ParionsSport
  // Pour le Loto Foot, il y a généralement 15 matchs
  
  const teams = [
    'PSG', 'OM', 'Lyon', 'Monaco', 'Lille', 'Rennes', 'Nice', 'Strasbourg',
    'Lens', 'Montpellier', 'Nantes', 'Brest', 'Reims', 'Toulouse', 'Lorient',
    'Le Havre', 'Metz', 'Clermont', 'Ajaccio', 'Auxerre', 'Troyes', 'Angers'
  ];

  const matches: ParionsSportMatch[] = [];
  const usedTeams = new Set<string>();

  // Générer 15 matchs aléatoirement
  for (let i = 0; i < 15; i++) {
    let homeTeam: string, awayTeam: string;
    
    // Sélectionner deux équipes différentes non utilisées
    do {
      homeTeam = teams[Math.floor(Math.random() * teams.length)];
      awayTeam = teams[Math.floor(Math.random() * teams.length)];
    } while (homeTeam === awayTeam || usedTeams.has(homeTeam) || usedTeams.has(awayTeam));

    usedTeams.add(homeTeam);
    usedTeams.add(awayTeam);

    // Générer une date/heure aléatoire dans les 7 jours suivant la date du tirage
    const baseDate = new Date(drawDate);
    const randomDays = Math.floor(Math.random() * 7);
    const matchDate = new Date(baseDate);
    matchDate.setDate(baseDate.getDate() + randomDays);
    matchDate.setHours(15 + Math.floor(Math.random() * 6), 0, 0, 0); // Entre 15h et 21h

    // Générer des cotes réalistes
    const homeAdvantage = Math.random() * 0.5 + 0.75; // Avantage domicile
    const baseHomeOdd = 1.8 + Math.random() * 2.2;
    const baseDrawOdd = 3.0 + Math.random() * 1.5;
    const baseAwayOdd = 1.8 + Math.random() * 2.2;

    matches.push({
      homeTeam,
      awayTeam,
      matchDateTime: matchDate.toISOString(),
      homeOdds: Math.round((baseHomeOdd * homeAdvantage) * 100) / 100,
      drawOdds: Math.round(baseDrawOdd * 100) / 100,
      awayOdds: Math.round((baseAwayOdd / homeAdvantage) * 100) / 100,
      competition: 'Ligue 1'
    });
  }

  return matches;
}