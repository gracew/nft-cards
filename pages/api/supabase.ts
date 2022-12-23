import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mqpjnvbjczekbcaxnikd.supabase.co';
const supabaseKey = process.env.SERVICE_SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey!);
