import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ljtwvvvtdjhchnfbwvhz.supabase.co";
const supabaseAnonKey = "sb_publishable_7Qua1GzyLUDXRVq2jRhOqQ_0--ukgHk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
