import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'rjoxluyttsynswogqlun';
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = 'sb_publishable_F9fY4Wa6zG9oZkrGgHR4RA_iXTMJ8sI';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface LoginRecord {
  id: string;
  email: string;
  role: string;
  status: 'AUTHORIZED' | 'REJECTED';
  ip?: string;
  userAgent?: string;
  timestamp: string;
  supabaseSynced: boolean;
  supabaseError?: string;
}

/**
 * Record a login event into Supabase
 */
export async function recordLoginInSupabase(record: Omit<LoginRecord, 'id' | 'supabaseSynced'>): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Attempt to register / sync session with Supabase Auth (GoTrue API)
    if (record.status === 'AUTHORIZED' && record.email.includes('@')) {
      try {
        await supabase.auth.signUp({
          email: record.email,
          password: 'hemlo@guys123',
          options: {
            data: {
              role: record.role,
              last_login: record.timestamp,
              app_name: 'TrustLens',
            },
          },
        });
      } catch (authErr) {
        // Supabase Auth will return error if already registered, which is fine
        console.debug('Supabase auth sync notice:', authErr);
      }
    }

    // 2. Attempt insert into public.login_details or public.logins if table exists
    const { error: tableError } = await supabase
      .from('login_details')
      .insert([
        {
          email: record.email,
          role: record.role,
          status: record.status,
          ip_address: record.ip || 'client-browser',
          created_at: record.timestamp,
        },
      ]);

    if (tableError) {
      console.debug('Supabase table insert notice (table might need creation in SQL editor):', tableError.message);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to log in Supabase:', err);
    return { success: false, error: err.message };
  }
}
