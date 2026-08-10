import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jncfwheinkwbvhqfmmoo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY2Z3aGVpbmt3YnZocWZtbW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzU1MDgsImV4cCI6MjA5OTYxMTUwOH0.XrL6SiCAaYVWtkEtHlKkEjAM3F7l0ua8BIOFcHg3AQI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
