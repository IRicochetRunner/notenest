// src/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yfgjwpvfegtcqgkodbak.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2p3cHZmZWd0Y3Fna29kYmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMTE3MzksImV4cCI6MjA4ODY4NzczOX0.zSByj5Jk54n2lAuLjiNFaEA1cjA3wBzkbyw_7jcR6t4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);