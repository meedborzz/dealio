import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Environment Check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set (hidden)' : 'Missing');

console.log('🔧 Environment Check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set (hidden)' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables!');
  console.error('');
  console.error('');
  console.error('Get these values from your Supabase Dashboard:');
  console.error('1. Go to https://supabase.com/dashboard');
  console.error('2. Select your project');
  console.error('3. Go to Settings → API');
  console.error('4. Copy Project URL and Service Role Key');
  console.error('Please ensure your .env file contains:');
  console.error('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here');
  console.error('');
  console.error('You can find these values in your Supabase Dashboard:');
  console.error('1. Go to https://supabase.com/dashboard');
  console.error('2. Select your project');
  console.error('3. Go to Settings → API');
  console.error('4. Copy the Project URL and Service Role Key');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  console.error('❌ Invalid VITE_SUPABASE_URL format!');
  console.error('Expected format: https://your-project.supabase.co');
  console.error('Current value:', supabaseUrl);
  process.exit(1);
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  console.error('❌ Invalid VITE_SUPABASE_URL format!');
  console.error('Expected: https://your-project.supabase.co');
  console.error('Received:', supabaseUrl);
  process.exit(1);
}

console.log('🔗 Creating Supabase client...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function creditExistingUsers() {
  console.log('💰 Starting wallet crediting for existing users...');
  
  try {
    // Test connection first
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
      .maybeSingle();
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      console.error('');
      console.error('Common causes:');
      console.error('1. Incorrect SUPABASE_SERVICE_ROLE_KEY');
      console.error('2. Project URL mismatch');
      console.error('3. Network connectivity issues');
      console.error('4. Supabase project suspended or deleted');
      return;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test connection first
    console.log('🔍 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
      .maybeSingle();
    
    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      console.error('');
      console.error('This could be due to:');
      console.error('1. Incorrect VITE_SUPABASE_URL');
      console.error('2. Invalid SUPABASE_SERVICE_ROLE_KEY');
      console.error('3. Supabase project not accessible');
      console.error('4. Network connectivity issues');
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    
    // Get all users with their activity counts
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        full_name,
        wallet_balance,
        role,
        loyalty_points,
        completed_bookings_count
      `)
      .eq('role', 'client');

    if (usersError) throw usersError;

    console.log(`👥 Found ${users?.length || 0} client users`);

    if (!users || users.length === 0) {
      console.log('ℹ️  No client users found to credit.');
      console.log('   Users may need to have profile records created first.');
      return;
    }

    for (const user of users || []) {
      console.log(`\n💼 Processing user: ${user.full_name || user.id}`);
      
      let totalCredited = 0;
      
      // Check current wallet balance
      const currentBalance = user.wallet_balance || 0;
      console.log(`   Current balance: ${currentBalance} DH`);
      console.log(`   Loyalty points: ${user.loyalty_points || 0}`);
      console.log(`   Completed bookings: ${user.completed_bookings_count || 0}`);
      
      // Count reviews by this user
      const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      // Count completed bookings by this user
      const { count: completedBookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');
      
      console.log(`   Reviews: ${reviewCount || 0}, Completed bookings: ${completedBookingCount || 0}`);
      
      // Only credit if wallet balance is low (less than expected)
      const expectedBalance = 20 + (reviewCount || 0) * 5 + (completedBookingCount || 0) * 2;
      
      if (currentBalance < expectedBalance) {
        console.log(`   Expected balance: ${expectedBalance} DH, crediting difference...`);
        
        // Credit welcome bonus if balance is 0 or very low
        if (currentBalance < 20) {
          try {
            const { error: walletError } = await supabase.rpc('add_wallet_transaction', {
              p_user_id: user.id,
              p_transaction_type: 'welcome',
              p_amount: 20,
              p_description: 'Bonus de bienvenue - Merci de faire partie de Dealio Beauty!'
            });
            
            if (walletError) {
              console.error(`   ❌ Welcome bonus failed:`, walletError.message);
            } else {
              totalCredited += 20;
              console.log(`   ✅ Welcome bonus: +20 DH`);
            }
          } catch (error) {
            console.error(`   ❌ Welcome bonus error:`, error.message);
          }
        }
        
        // Credit for reviews
        if (reviewCount && reviewCount > 0) {
        }
      }
    }
    console.log('📝 Demo data setup completed!');
          try {
            const { error: reviewError } = await supabase.rpc('add_wallet_transaction', {
              p_user_id: user.id,
              p_transaction_type: 'review',
              p_amount: reviewAmount,
              p_description: `Récompense pour ${reviewCount} avis laissé${reviewCount > 1 ? 's' : ''}`
            });
            
            if (reviewError) {
              console.error(`   ❌ Review rewards failed:`, reviewError.message);
            } else {
              totalCredited += reviewAmount;
              console.log(`   ✅ Review rewards: +${reviewAmount} DH`);
            }
          } catch (error) {
            console.error(`   ❌ Review rewards error:`, error.message);
          }

    console.log('\n🎉 Wallet crediting complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   • Welcome bonus: 20 DH per new user');
    console.log('   • Review rewards: 5 DH per review');
    console.log('   • Booking cashback: 2 DH per completed booking');
          try {
            const { error: bookingError } = await supabase.rpc('add_wallet_transaction', {
              p_user_id: user.id,
              p_transaction_type: 'cashback',
              p_amount: bookingAmount,
              p_description: `Cashback pour ${completedBookingCount} service${completedBookingCount > 1 ? 's' : ''} terminé${completedBookingCount > 1 ? 's' : ''}`
            });
            
            if (bookingError) {
              console.error(`   ❌ Booking cashback failed:`, bookingError.message);
            } else {
              totalCredited += bookingAmount;
              console.log(`   ✅ Booking cashback: +${bookingAmount} DH`);
            }
          } catch (error) {
            console.error(`   ❌ Booking cashback error:`, error.message);
          }
    if (error.message?.includes('fetch failed')) {
      console.error('This appears to be a network connectivity issue.');
      console.error('Please check:');
      console.error('1. Your internet connection');
      console.error('2. Your Supabase project URL and credentials');
      console.error('3. Firewall or proxy settings');
    }
  }
}

creditExistingUsers();
    console.error('');
    console.error('Troubleshooting steps:');
    console.error('1. Verify your .env file has the correct Supabase credentials');
    console.error('2. Check if your Supabase project is active');
    console.error('3. Ensure network connectivity to Supabase servers');
    console.error('4. Try running the script again after a few minutes');