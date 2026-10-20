import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wafyggcuzrypmoraiuzq.supabase.co'
const supabaseKey = 'sb_publishable_GIjrPyT4YaQcW3vi58Rpkg_up0-InBH'

export const supabase = createClient(supabaseUrl, supabaseKey)