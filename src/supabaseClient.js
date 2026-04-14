import { createClient } from '@supabase/supabase-js'

// ⚠️ Вставь сюда свои данные из Supabase Dashboard!
const supabaseUrl = 'https://eltwrlyuingwlrccrjso.supabase.co'
const supabaseAnonKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdHdybHl1aW5nd2xyY2NyanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjI3ODAsImV4cCI6MjA5MTY5ODc4MH0.avsThNJEsIWSmIA7EFm3fqmcyzIrTdECVaKTMSND2yk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
