import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL );
import { prisma } from '../utils/utils.js';
import { CompleteReservation } from '../controllers/reservation.js';

const RESERVATION_JOB_PREFIX = 'reservation:job:';

async function checkAndProcessReservations() {
  // Get all keys matching the reservation job pattern
  const keys = await redis.keys(`${RESERVATION_JOB_PREFIX}*`);
  
  const now = Date.now();
  
  for (const key of keys) {
    const completionTime = await redis.get(key);
    
    if (parseInt(completionTime) <= now) {
      // Extract reservation ID from the key
      const reservationId = parseInt(key.replace(RESERVATION_JOB_PREFIX, ''));
      
      // Complete the reservation
      await CompleteReservation(reservationId);
      
      // Remove the job from Redis
      await redis.del(key);
    }
  }
}

// Run the check every minute
setInterval(checkAndProcessReservations, 60 * 1000);

// Also run immediately on startup
checkAndProcessReservations();

console.log('Reservation scheduler started'); 