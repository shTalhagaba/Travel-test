import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SUPABASE_URL = 'https://uzfdzhchadqxgdvshyto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6ZmR6aGNoYWRxeGdkdnNoeXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDAzODUsImV4cCI6MjA4MTAxNjM4NX0.jgghFHG6aTpEK4UBU_8oZiRdyFo5GbD8CDADYlOoa5s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
     storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,  
    detectSessionInUrl: false,
  },
});
