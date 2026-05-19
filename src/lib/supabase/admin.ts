import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — uses the service-role key.
 * NEVER use this in client components. Only inside server actions / API routes
 * where elevated privileges are required (e.g. creating users via admin API).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
