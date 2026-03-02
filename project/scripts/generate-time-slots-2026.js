import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generateSlotsForHours(openTime, closeTime, serviceDuration, maxBookingsPerSlot, breakStart, breakEnd) {
  const slots = [];

  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;

  let currentTimeInMinutes = openTimeInMinutes;

  while (currentTimeInMinutes + serviceDuration <= closeTimeInMinutes) {
    const startHour = Math.floor(currentTimeInMinutes / 60);
    const startMinute = currentTimeInMinutes % 60;

    const endTimeInMinutes = currentTimeInMinutes + serviceDuration;
    const endHour = Math.floor(endTimeInMinutes / 60);
    const endMinute = endTimeInMinutes % 60;

    let skipSlot = false;
    if (breakStart && breakEnd) {
      const [breakStartHour, breakStartMinute] = breakStart.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = breakEnd.split(':').map(Number);
      const breakStartInMinutes = breakStartHour * 60 + breakStartMinute;
      const breakEndInMinutes = breakEndHour * 60 + breakEndMinute;

      skipSlot = (currentTimeInMinutes >= breakStartInMinutes && currentTimeInMinutes < breakEndInMinutes) ||
                 (endTimeInMinutes > breakStartInMinutes && endTimeInMinutes <= breakEndInMinutes) ||
                 (currentTimeInMinutes < breakStartInMinutes && endTimeInMinutes > breakEndInMinutes);
    }

    if (!skipSlot) {
      slots.push({
        start_time: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`,
        end_time: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`,
        available_spots: maxBookingsPerSlot,
        is_available: true,
      });
    }

    currentTimeInMinutes += serviceDuration;
  }

  return slots;
}

function generateTimeSlotsForDay(date, workingHours, serviceDuration, maxBookingsPerSlot) {
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();

  const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = DAY_NAMES[dayOfWeek];

  const dayHours = workingHours[dayName];

  if (!dayHours || dayHours.closed) {
    return [];
  }

  return generateSlotsForHours(
    dayHours.open,
    dayHours.close,
    serviceDuration,
    maxBookingsPerSlot,
    dayHours.breakStart,
    dayHours.breakEnd
  );
}

async function generateTimeSlots() {
  console.log('🚀 Generating time slots for 2026...');

  try {
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select(`
        id,
        title,
        duration,
        business_id,
        businesses (
          id,
          name,
          working_hours
        )
      `)
      .eq('is_active', true);

    if (dealsError) throw dealsError;

    if (!deals || deals.length === 0) {
      console.log('⚠️  No active deals found');
      return;
    }

    console.log(`📋 Found ${deals.length} active deals`);

    const startDate = new Date('2026-01-01');
    const daysToGenerate = 90;

    let totalSlotsGenerated = 0;

    for (const deal of deals) {
      console.log(`\n📅 Generating slots for: ${deal.title}`);

      const workingHours = deal.businesses?.working_hours || {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { closed: true },
      };

      const serviceDuration = deal.duration || 60;
      const maxBookingsPerSlot = 3;

      const slotsToInsert = [];

      for (let i = 0; i < daysToGenerate; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];

        const daySlots = generateTimeSlotsForDay(dateString, workingHours, serviceDuration, maxBookingsPerSlot);

        for (const slot of daySlots) {
          slotsToInsert.push({
            deal_id: deal.id,
            date: dateString,
            start_time: slot.start_time,
            end_time: slot.end_time,
            available_spots: slot.available_spots,
            is_available: slot.is_available,
          });
        }
      }

      if (slotsToInsert.length > 0) {
        const batchSize = 500;
        for (let i = 0; i < slotsToInsert.length; i += batchSize) {
          const batch = slotsToInsert.slice(i, i + batchSize);
          const { error: insertError } = await supabase
            .from('time_slots')
            .insert(batch);

          if (insertError) {
            console.error(`❌ Error inserting batch:`, insertError);
          } else {
            totalSlotsGenerated += batch.length;
            console.log(`   ✓ Inserted ${batch.length} slots (${i + batch.length}/${slotsToInsert.length})`);
          }
        }
      }
    }

    console.log(`\n✅ Successfully generated ${totalSlotsGenerated} time slots for 2026!`);
    console.log(`📊 Time range: January 1 - March 31, 2026 (90 days)`);

  } catch (error) {
    console.error('❌ Error generating time slots:', error);
  }
}

generateTimeSlots();
