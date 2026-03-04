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
    console.log('Fetching roles from user_profiles...');

    const query = supabase
        .from('user_profiles')
        .select('role');

    const { data, error } = await query;

    if (error) {
        console.error('Query Error:', error);
    } else {
        console.log('Query Success!');
        const roles = data.map(r => r.role);
        const uniqueRoles = [...new Set(roles)];
        console.log(`Unique roles found:`, uniqueRoles);
        console.log(`Total profiles: ${data.length}`);
    }
}

test();
