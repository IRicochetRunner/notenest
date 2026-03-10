// src/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yfgjwpvfegtcqgkodbak.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ftZcNcaZU5zY4hG1PB6Q8Q_TjfPW5h8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);