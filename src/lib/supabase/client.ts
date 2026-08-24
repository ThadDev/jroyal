import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;
let clientUrl: string | undefined;

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://placeholder.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "placeholder-anon-key";

    if (client && clientUrl === supabaseUrl) {
        return client;
    }

    clientUrl = supabaseUrl;
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
    return client;
}
