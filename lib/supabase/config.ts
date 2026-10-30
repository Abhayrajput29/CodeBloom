export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishableKey) return null;
  try {
    const parsedUrl = new URL(url);
    const localHttp = parsedUrl.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(parsedUrl.hostname);
    if ((parsedUrl.protocol !== "https:" && !localHttp) || parsedUrl.username || parsedUrl.password) return null;
  } catch {
    return null;
  }
  return { url, publishableKey };
}

export function requireSupabaseConfig() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  return config;
}
