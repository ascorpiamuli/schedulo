import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  // Helper for structured logging
  const log = (level: 'info' | 'error' | 'debug', message: string, data?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      level,
      message,
      executionTimeMs: Date.now() - startTime,
      ...data
    };
    console.log(JSON.stringify(logEntry));
  };

  log('info', 'Function invoked', { 
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    log('info', 'Handling OPTIONS preflight');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      log('error', 'Method not allowed', { method: req.method });
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // Parse request body
    let emailPrefix: string;
    try {
      const body = await req.json();
      emailPrefix = body.emailPrefix;
      log('info', 'Request body parsed', { emailPrefix, hasEmailPrefix: !!emailPrefix });
    } catch (parseError) {
      log('error', 'Failed to parse request body', { error: parseError.message });
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    if (!emailPrefix) {
      log('error', 'Email prefix missing from request');
      return new Response(
        JSON.stringify({ error: "Email prefix is required" }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    log('info', 'Looking up user with email prefix', { emailPrefix });

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    log('info', 'Environment variables check', { 
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      supabaseUrlPrefix: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : null
    });

    if (!supabaseUrl || !serviceRoleKey) {
      log('error', 'Missing required environment variables');
      throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    }

    // Create Supabase admin client
    log('info', 'Creating Supabase admin client');
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // First, try to find user by username in profiles
    log('info', 'Searching profiles by username', { username: emailPrefix });
    const { data: profileByUsername, error: profileByUsernameError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('username', emailPrefix)
      .maybeSingle();

    if (profileByUsernameError) {
      log('error', 'Error querying profiles by username', { 
        error: profileByUsernameError.message,
        details: profileByUsernameError
      });
    } else if (profileByUsername) {
      log('info', 'Found profile by username', { 
        userId: profileByUsername.id,
        username: profileByUsername.username
      });
      return new Response(
        JSON.stringify({ profile: profileByUsername }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    } else {
      log('info', 'No profile found with username', { username: emailPrefix });
    }

    // If not found by username, try auth.users
    log('info', 'Fetching users from auth.users via admin API');
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      log('error', 'Error listing users from auth', { 
        error: userError.message,
        status: userError.status
      });
      throw userError;
    }

    log('info', 'Successfully fetched users from auth', { 
      totalUsers: userData.users.length
    });

    // Find user where email starts with the prefix
    const matchedUser = userData.users.find(user => {
      if (!user.email) return false;
      const localPart = user.email.split('@')[0].toLowerCase();
      const match = localPart === emailPrefix.toLowerCase();
      if (match) {
        log('debug', 'Found matching user', { 
          userId: user.id,
          email: user.email,
          localPart 
        });
      }
      return match;
    });

    if (!matchedUser) {
      log('info', 'No user found with matching email prefix', { emailPrefix });
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { 
          status: 404, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    log('info', 'Found matching user', { 
      userId: matchedUser.id,
      email: matchedUser.email,
      hasUserMetadata: !!matchedUser.user_metadata
    });

    // Check if profile exists
    log('info', 'Checking for existing profile', { userId: matchedUser.id });
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', matchedUser.id)
      .maybeSingle();

    if (profileError) {
      log('error', 'Error fetching profile', { 
        userId: matchedUser.id,
        error: profileError.message,
        details: profileError
      });
      throw profileError;
    }

    // If profile doesn't exist, create one
    if (!profile) {
      log('info', 'Creating new profile for user', { 
        userId: matchedUser.id,
        emailPrefix,
        userMetadata: matchedUser.user_metadata
      });
      
      const newProfile = {
        id: matchedUser.id,
        username: emailPrefix.toLowerCase(),
        full_name: matchedUser.user_metadata?.full_name || null,
        avatar_url: matchedUser.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      log('info', 'Inserting new profile', { newProfile });

      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        log('error', 'Error creating profile', { 
          userId: matchedUser.id,
          error: createError.message,
          details: createError,
          code: createError.code
        });
        throw createError;
      }

      log('info', 'Successfully created profile', { 
        userId: createdProfile.id,
        username: createdProfile.username
      });

      profile = createdProfile;
    } else {
      log('info', 'Found existing profile', { 
        userId: profile.id,
        username: profile.username
      });
    }

    const executionTime = Date.now() - startTime;
    log('info', 'Function completed successfully', { 
      userId: profile.id,
      executionTimeMs: executionTime
    });

    return new Response(
      JSON.stringify({ profile }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    const executionTime = Date.now() - startTime;
    log('error', 'Function error', { 
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      executionTimeMs: executionTime
    });

    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.name,
        requestId 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});