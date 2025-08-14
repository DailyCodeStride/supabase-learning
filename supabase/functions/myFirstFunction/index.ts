// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs

/// <reference lib="deno.ns" />

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get request body
    const { action = 'list', name } = await req.json().catch(() => ({}))

    let data

    if (action === 'list') {
      // Fetch profiles from database
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10)
      if (error) throw error
      data = {
        message: 'Profiles fetched successfully',
        profiles,
        count: profiles?.length || 0
      }
    } else if (action === 'add') {
      // Add a new profile with random values
      function randomString(len = 8) {
        return Math.random().toString(36).substring(2, 2 + len)
      }
      const newProfile = {
        username: `user_${randomString(5)}`,
        email: `${randomString(7)}@example.com`,
        full_name: `Name ${randomString(4)}`,
        website: `https://www.${randomString(6)}.dev`
      }
      const { data: inserted, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
      if (error) throw error
      // Get total count after insert
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      data = {
        message: 'Profile added successfully',
        profile: inserted?.[0] || null,
        total_count: count ?? null
      }
    } else {
      // Original hello functionality
      data = {
        message: `Hello ${name || 'World'}!`,
        timestamp: new Date().toISOString()
      }
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        } 
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  # List profiles:
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/myFirstFunction' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"action":"list"}'

  # Add a random profile:
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/myFirstFunction' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"action":"add"}'

*/
