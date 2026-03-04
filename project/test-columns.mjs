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

async function checkColumns() {
    console.log('Testing column existence by querying single columns...');

    const columns = ['id', 'full_name', 'phone', 'date_of_birth', 'role', 'completed_bookings_count', 'loyalty_points', 'created_at', 'updated_at'];

    for (const col of columns) {
        const { error } = await supabase.from('user_profiles').select(col).limit(1);
        if (error) {
            console.error(`Column test FAILED for ${col}:`, error.message);
        } else {
            console.log(`Column ${col} exists.`);
        }
    }
}

checkColumns();
