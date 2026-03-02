import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearDemoData() {
  console.log('Starting demo data cleanup...\n');

  try {
    console.log('1. Clearing wallet transactions...');
    const { error: walletError } = await supabase
      .from('wallet_transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (walletError) throw walletError;
    console.log('   ✓ Wallet transactions cleared');

    console.log('2. Clearing waiting lists...');
    const { error: waitingError } = await supabase
      .from('waiting_lists')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (waitingError) throw waitingError;
    console.log('   ✓ Waiting lists cleared');

    console.log('3. Clearing saved searches...');
    const { error: searchesError } = await supabase
      .from('saved_searches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (searchesError) throw searchesError;
    console.log('   ✓ Saved searches cleared');

    console.log('4. Clearing push subscriptions...');
    const { error: pushError } = await supabase
      .from('push_subscriptions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (pushError) throw pushError;
    console.log('   ✓ Push subscriptions cleared');

    console.log('5. Clearing messages...');
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (messagesError) throw messagesError;
    console.log('   ✓ Messages cleared');

    console.log('6. Clearing conversations...');
    const { error: conversationsError } = await supabase
      .from('conversations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (conversationsError) throw conversationsError;
    console.log('   ✓ Conversations cleared');

    console.log('7. Clearing user interactions...');
    const { error: interactionsError } = await supabase
      .from('user_interactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (interactionsError) throw interactionsError;
    console.log('   ✓ User interactions cleared');

    console.log('8. Clearing notifications...');
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (notificationsError) throw notificationsError;
    console.log('   ✓ Notifications cleared');

    console.log('9. Clearing booking validations...');
    const { error: validationsError } = await supabase
      .from('booking_validations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (validationsError) throw validationsError;
    console.log('   ✓ Booking validations cleared');

    console.log('10. Clearing commission logs...');
    const { error: commissionsError } = await supabase
      .from('commission_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (commissionsError) throw commissionsError;
    console.log('   ✓ Commission logs cleared');

    console.log('11. Clearing reviews...');
    const { error: reviewsError } = await supabase
      .from('reviews')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (reviewsError) throw reviewsError;
    console.log('   ✓ Reviews cleared');

    console.log('12. Clearing favorites...');
    const { error: favoritesError } = await supabase
      .from('favorites')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (favoritesError) throw favoritesError;
    console.log('   ✓ Favorites cleared');

    console.log('13. Clearing bookings...');
    const { error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (bookingsError) throw bookingsError;
    console.log('   ✓ Bookings cleared');

    console.log('14. Clearing QR codes...');
    const { error: qrError } = await supabase
      .from('qr_codes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (qrError) throw qrError;
    console.log('   ✓ QR codes cleared');

    console.log('15. Clearing time slots...');
    const { error: slotsError } = await supabase
      .from('time_slots')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (slotsError) throw slotsError;
    console.log('   ✓ Time slots cleared');

    console.log('16. Clearing deals...');
    const { error: dealsError } = await supabase
      .from('deals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (dealsError) throw dealsError;
    console.log('   ✓ Deals cleared');

    console.log('17. Resetting business metrics...');
    const { error: businessError } = await supabase
      .from('businesses')
      .update({
        rating: 0,
        review_count: 0,
        total_commission_owed: 0,
        total_validated_bookings: 0
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (businessError) throw businessError;
    console.log('   ✓ Business metrics reset');

    console.log('18. Resetting user profiles...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        completed_bookings_count: 0,
        loyalty_points: 0,
        wallet_balance: 0,
        total_spent: 0
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (profileError) throw profileError;
    console.log('   ✓ User profiles reset');

    console.log('\n✅ Demo data cleanup completed successfully!');
    console.log('\nSummary:');
    console.log('- All bookings, messages, and interactions cleared');
    console.log('- All deals and time slots removed');
    console.log('- User and business metrics reset to zero');
    console.log('- User accounts and businesses preserved (structure intact)');
    console.log('\nYour app is now ready for production use!');

  } catch (error) {
    console.error('\n❌ Error clearing demo data:', error.message);
    process.exit(1);
  }
}

clearDemoData();
