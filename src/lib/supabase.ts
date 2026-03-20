import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uxhjwzfbptbimbvdyvxl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4aGp3emZicHRiaW1idmR5dnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTA5MjEsImV4cCI6MjA4OTU4NjkyMX0.2EzwmB_A2H42Wz-nsq2tGQp5xGhxI62hR2XyXmPislY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
