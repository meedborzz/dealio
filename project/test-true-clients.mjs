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
    console.log('Fetching policies...');

    // Can't query pg_policies directly via REST API if it's not exposed, 
    // but let's see if we can query user_profiles and see the number of total clients.
    const query = supabase
        .from('user_profiles')
        .select('id, role', { count: 'exact' })
        .eq('role', 'client');

    const { data, error, count } = await query;

    if (error) {
        console.error('Query Error:', error);
    } else {
        console.log(`Query Success via Service Role Key! Found ${count} clients.`);
    }
}

test();
