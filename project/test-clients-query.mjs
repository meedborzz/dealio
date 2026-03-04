import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envPath = '.env.local';
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    envContent = fs.readFileSync('.env', 'utf8');
}

const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=([^\n]+)/)[1].trim();
const supabaseKey = envContent.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=([^\n]+)/)?.[1]?.trim() || envContent.match(/VITE_SUPABASE_ANON_KEY=([^\n]+)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Admin Clients query...');

    const query = supabase
        .from('user_profiles')
        .select(`
      id,
      full_name,
      phone,
      date_of_birth,
      role,
      completed_bookings_count,
      loyalty_points,
      created_at,
      updated_at
    `, { count: 'exact' })
        .eq('role', 'client')
        .range(0, 49);

    const { data, error, count } = await query;

    if (error) {
        console.error('Query Error:', error);
    } else {
        console.log('Query Success!');
        console.log(`Found ${count} clients. Returned ${data?.length} records.`);
    }
}

test();
