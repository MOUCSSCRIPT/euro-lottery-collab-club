import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the latest EuroMillions results from the API
    const apiResponse = await fetch('https://euromillions.api.pedromealha.dev/v1/draws/latest');
    
    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.status}`);
    }

    const resultData = await apiResponse.json();
    console.log('API Response:', resultData);

    // Extract the draw data
    const drawDate = new Date(resultData.date).toISOString().split('T')[0];
    const winningNumbers = resultData.numbers.sort((a: number, b: number) => a - b);
    const winningStars = resultData.stars.sort((a: number, b: number) => a - b);
    const jackpotAmount = resultData.jackpot || null;

    // Insert or update the draw result
    const { data: existingDraw, error: selectError } = await supabase
      .from('draw_results')
      .select('id')
      .eq('draw_date', drawDate)
      .single();

    let drawResultId: string;

    if (selectError && selectError.code === 'PGRST116') {
      // No existing draw, insert new one
      const { data: newDraw, error: insertError } = await supabase
        .from('draw_results')
        .insert({
          draw_date: drawDate,
          winning_numbers: winningNumbers,
          winning_stars: winningStars,
          jackpot_amount: jackpotAmount
        })
        .select('id')
        .single();

      if (insertError) {
        throw new Error(`Failed to insert draw result: ${insertError.message}`);
      }

      drawResultId = newDraw.id;
      console.log('Inserted new draw result:', drawResultId);
    } else if (selectError) {
      throw new Error(`Failed to check existing draw: ${selectError.message}`);
    } else {
      // Update existing draw
      const { error: updateError } = await supabase
        .from('draw_results')
        .update({
          winning_numbers: winningNumbers,
          winning_stars: winningStars,
          jackpot_amount: jackpotAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDraw.id);

      if (updateError) {
        throw new Error(`Failed to update draw result: ${updateError.message}`);
      }

      drawResultId = existingDraw.id;
      console.log('Updated existing draw result:', drawResultId);
    }

    // Check for wins using the database function
    const { error: checkWinsError } = await supabase.rpc('check_grid_wins', {
      p_draw_result_id: drawResultId,
      p_winning_numbers: winningNumbers,
      p_winning_stars: winningStars
    });

    if (checkWinsError) {
      console.error('Error checking wins:', checkWinsError);
      throw new Error(`Failed to check wins: ${checkWinsError.message}`);
    }

    console.log('Successfully processed draw and checked for wins');

    return new Response(
      JSON.stringify({
        success: true,
        drawDate,
        winningNumbers,
        winningStars,
        jackpotAmount,
        drawResultId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in fetch-euromillions-results function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}