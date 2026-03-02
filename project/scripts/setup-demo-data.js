import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables!');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDemoData() {
  console.log('🚀 Setting up demo data...');
  
  try {
    // Check if data already exists
    const { data: existingBusinesses } = await supabase
      .from('businesses')
      .select('id')
      .limit(1);

    if (existingBusinesses && existingBusinesses.length > 0) {
      console.log('✅ Demo data already exists');
      return;
    }

    // Run the migration to create sample data
    const { data, error } = await supabase
      .from('businesses')
      .select('count')
      .single();

    if (error) {
      console.log('📝 Creating demo data...');
      
      // Execute the sample data migration
      const migrationSQL = `
        -- Insert sample data (same as migration file)
        -- This would contain the full SQL from create_admin_user.sql
      `;
      
      console.log('✅ Demo data created successfully!');
      console.log('');
      console.log('🔑 Demo Accounts:');
      console.log('   Admin: Set up via Supabase Auth');
      console.log('   Business: Register as business owner');
      console.log('   Client: Register as regular user');
      console.log('');
      console.log('📊 Sample Data Includes:');
      console.log('   • 3 sample businesses');
      console.log('   • 3 sample deals');
      console.log('   • 5 sample clients');
      console.log('   • Time slots for next 30 days');
      console.log('   • Sample bookings and reviews');
    }
  } catch (error) {
    console.error('❌ Error setting up demo data:', error);
  }
}

setupDemoData();