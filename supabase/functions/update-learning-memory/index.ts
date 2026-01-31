import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, deviceFingerprint, updates } = await req.json();
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Check if memory exists
    let query = supabase.from('learning_user_memory').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (deviceFingerprint) {
      query = query.eq('device_fingerprint', deviceFingerprint).is('user_id', null);
    } else {
      return new Response(JSON.stringify({ error: "No identifier provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const { data: existingMemory, error: fetchError } = await query.maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching memory:', fetchError);
      throw fetchError;
    }
    
    let result;
    
    if (existingMemory) {
      // Merge arrays instead of replacing
      const mergedUpdates: any = { updated_at: new Date().toISOString() };
      
      if (updates.goals) {
        const existingGoals = existingMemory.goals || [];
        mergedUpdates.goals = [...existingGoals, ...updates.goals];
      }
      
      if (updates.learning_interests) {
        const existingInterests = existingMemory.learning_interests || [];
        const newInterests = [...new Set([...existingInterests, ...updates.learning_interests])];
        mergedUpdates.learning_interests = newInterests;
      }
      
      if (updates.accomplishments) {
        const existingAccomplishments = existingMemory.accomplishments || [];
        mergedUpdates.accomplishments = [...existingAccomplishments, ...updates.accomplishments];
      }
      
      if (updates.personality_notes) {
        mergedUpdates.personality_notes = updates.personality_notes;
      }
      
      if (updates.last_mood) {
        mergedUpdates.last_mood = updates.last_mood;
      }
      
      if (updates.conversation_summary) {
        mergedUpdates.conversation_summary = updates.conversation_summary;
      }
      
      if (updates.preferences) {
        mergedUpdates.preferences = { ...(existingMemory.preferences || {}), ...updates.preferences };
      }
      
      const { data, error } = await supabase
        .from('learning_user_memory')
        .update(mergedUpdates)
        .eq('id', existingMemory.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new memory
      const insertData: any = {
        ...updates,
      };
      if (userId) insertData.user_id = userId;
      if (deviceFingerprint && !userId) insertData.device_fingerprint = deviceFingerprint;
      
      const { data, error } = await supabase
        .from('learning_user_memory')
        .insert([insertData])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    return new Response(JSON.stringify({ success: true, memory: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Update memory error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
