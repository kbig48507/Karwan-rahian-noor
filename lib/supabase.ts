import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://suwaxhdovhwipzmvshft.supabase.co';
const supabaseAnonKey = 'sb_publishable_PXcU13w2glE8I0hl1XUz4w_aFETD3J-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);