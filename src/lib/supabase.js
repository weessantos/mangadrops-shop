import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://wcwxjqfsnvpyndmpbngr.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjd3hqcWZzbnZweW5kbXBibmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTE2MjAsImV4cCI6MjA4OTg2NzYyMH0.-PnRFEutExK9LSWietEwfYN6I0CyezIeP-Au9fD0_Z8"

export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
)