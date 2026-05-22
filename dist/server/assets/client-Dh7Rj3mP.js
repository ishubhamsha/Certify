import { c as createClient } from "./index-DdGN5IVl.js";
function createSupabaseClient() {
  const SUPABASE_URL = "https://bvdwmgzdgpvacobdmmah.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2ZHdtZ3pkZ3B2YWNvYmRtbWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNDM2NTQsImV4cCI6MjA5NDgxOTY1NH0.2hDUfKBcgD6nWDwYX1EuElWwhHvFVYLXNwmwL36_6_M";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
export {
  supabase as s
};
