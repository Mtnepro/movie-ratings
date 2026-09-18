const SUPABASE_URL = "https://cbzslusotuxjep...supabase.co";
const SUPABASE_KEY = "sb_publishable-...";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase est connecté !");
