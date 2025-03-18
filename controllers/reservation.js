import { catchAsync, AppError } from "../utils/errorHandler.js";
import {prisma,router} from '../utils/utils.js'
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Key prefix for our reservation jobs
const RESERVATION_JOB_PREFIX = 'reservation:job:';

const GetReservations = catchAsync(async(req,res)=>{
  const reservations = await prisma.reservation.findMany({
    where: { userId: req.user.id },
    include: { bicycle: true }
  });
  res.json(reservations);
});

// Create a reservation with scheduling
const CreateReservation = catchAsync(async (req, res) => {
  const { bicycleId, hours, userId } = req.body;
  console.log('Raw hours from request:', hours, typeof hours);

  if (!bicycleId || !hours) {
    throw new AppError(400, 'BicycleId and Hours required');
  }

  // Validate hours input - use Number() instead of parseFloat for more precise decimal handling
  const hoursNum = Number(hours);
  console.log('Converted hoursNum:', hoursNum, typeof hoursNum);

  if (isNaN(hoursNum) || hoursNum <= 0) {
    throw new AppError(400, 'Hours must be a positive number');
  }
  
  // Check if hours is either an integer or 0.5
  if (hoursNum !== 0.5 && !Number.isInteger(hoursNum)) {
    throw new AppError(400, 'Hours must be either 0.5 or a positive integer');
  }

  const bicycle = await prisma.bicycle.findUnique({
    where: { id: parseInt(bicycleId) }
  });

  if (!bicycle) {
    throw new AppError(404, 'Bicycle not found');
  }

  if (!bicycle.available) {
    throw new AppError(400, 'Bicycle not available');
  }

  const reservation = await prisma.$transaction(async (tx) => {
    const startTime = new Date();
    
    // Calculate end time using minutes for precise timing
    const minutes = hoursNum * 60;
    console.log('Calculated minutes:', minutes);
    const endTime = new Date(startTime.getTime() + (minutes * 60000)); // Convert to milliseconds
    
    const reservation = await tx.reservation.create({
      data: {
        hours: hoursNum,  // Explicitly passing the converted number
        totalAmount: bicycle.hourlyRate * hoursNum,
        status: 'ACTIVE',
        paymentStatus: 'PENDING',
        startTime,
        endTime,
        user: {
          connect: {
            id: userId
          }
        },
        bicycle: {
          connect: {
            id: parseInt(bicycleId)
          }
        }
      },
      include: {
        user: true,
        bicycle: true
      }
    });

    await tx.bicycle.update({
      where: { id: parseInt(bicycleId) },
      data: { available: false }
    });
    
    return reservation;
  });

  // Convert hours to milliseconds for scheduling
  scheduleReservationCompletion(reservation.id, hoursNum);

  res.status(201).json(reservation);
});

// Function to mark reservation as completed
const CompleteReservation = async (reservationId) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Find the reservation
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { bicycle: true }
      });

      if (!reservation) {
        console.error(`Reservation with ID ${reservationId} not found`);
        return null;
      }

      if (reservation.status !== 'ACTIVE') {
        console.log(`Reservation ${reservationId} is not active, skipping completion`);
        return reservation;
      }

      // Update reservation status to completed
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'COMPLETED' }
      });

      // Make bicycle available again
      await tx.bicycle.update({
        where: { id: reservation.bicycle.id },
        data: { available: true }
      });

      return updatedReservation;
    });

    console.log(`Reservation ${reservationId} marked as completed`);
    return result;
  } catch (error) {
    console.error(`Error completing reservation ${reservationId}:`, error);
  }
};

// Replace in-memory scheduledJobs with Redis-based scheduling
const scheduleReservationCompletion = async (reservationId, hours) => {
  const jobKey = `${RESERVATION_JOB_PREFIX}${reservationId}`;
  
  // Cancel any existing scheduled job
  const existingJob = await redis.get(jobKey);
  if (existingJob) {
    await redis.del(jobKey);
    console.log(`Cancelled existing completion job for reservation ${reservationId}`);
  }

  // Calculate completion timestamp using minutes for precision
  const completionTime = Date.now() + (hours * 60 * 60 * 1000);
  
  // Store the job in Redis with the completion timestamp
  await redis.set(jobKey, completionTime);
  console.log(`Scheduled completion for reservation ${reservationId} in ${hours} hours`);
};

// Add a cleanup function for the ManualCompleteReservation handler
const cleanupReservationJob = async (reservationId) => {
  const jobKey = `${RESERVATION_JOB_PREFIX}${reservationId}`;
  await redis.del(jobKey);
};

// Update ManualCompleteReservation to use Redis cleanup
const ManualCompleteReservation = catchAsync(async (req, res) => {
  const reservationId  = req.params.id;
  console.log(reservationId)
  const result = await CompleteReservation(parseInt(reservationId));
  
  if (!result) {
    throw new AppError(404, 'Reservation not found');
  }
  
  // Clear the scheduled job from Redis
  await cleanupReservationJob(parseInt(reservationId));
  
  return res.status(200).json({
    status: 'success',
    data: result
  });
});

// Extend reservation
const ExtendReservation = catchAsync(async (req, res) => {
  const { additionalHours } = req.body;
  console.log(additionalHours);
  // Validate additional hours
  const additionalHoursNum = Number(additionalHours);
  if (!additionalHoursNum || (additionalHoursNum !== 0.5 && !Number.isInteger(additionalHoursNum)) || additionalHoursNum <= 0) {
    throw new AppError(400, 'Additional hours must be either 0.5 or a positive integer');
  }
  
  const reservation = await prisma.reservation.findFirst({
    where: { 
      id: parseInt(req.params.id),
      status: 'ACTIVE'
    },
    include: { bicycle: true }
  });

  if (!reservation) {
    throw new AppError(404, 'Active reservation not found');
  }

  // Calculate new end time using minutes
  const newEndTime = new Date(reservation.endTime);
  newEndTime.setMinutes(newEndTime.getMinutes() + (additionalHoursNum * 60));
  
  // Calculate new total amount as a number
  const additionalAmount = additionalHoursNum * reservation.bicycle.hourlyRate;
const newTotalAmount = Number(reservation.totalAmount) + additionalAmount;

  const updatedReservation = await prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      hours: reservation.hours + additionalHoursNum,
      totalAmount: newTotalAmount,
      paymentStatus: 'PENDING',
      endTime: newEndTime
    }
  });

  // Recalculate time remaining and reschedule completion
  const now = new Date();
  const remainingTimeInMs = newEndTime.getTime() - now.getTime();
  const remainingHours = Math.ceil(remainingTimeInMs / (60 * 60 * 1000));
  
  // Schedule with the new time
  scheduleReservationCompletion(reservation.id, remainingHours);

  res.json({
    ...updatedReservation,
    message: `Reservation extended by ${additionalHours} hours. New end time: ${newEndTime.toLocaleString()}`
  });
});

const CancelReservation = catchAsync(async(req,res)=>{
    const reservation = await prisma.$transaction(async (tx) => {
        const reservation = await tx.reservation.update({
          where: {
            id: parseInt(req.params.id),
            status: 'ACTIVE'
          },
          data: { status: 'CANCELLED' }
        });
  
        await tx.bicycle.update({
          where: { id: reservation.bicycleId },
          data: { available: true }
        });
  
        return reservation;
    });

    // Clean up the scheduled job from Redis
    await cleanupReservationJob(reservation.id);
  
    res.json(reservation);
});

const GetActiveReservations = catchAsync(async(req, res) => {
  const activeReservations = await prisma.reservation.findMany({
    where: { 
      userId: parseInt(req.params.id),
      status: 'ACTIVE'
    },
    include: { 
      bicycle: true 
    }
  });
  
  res.json(activeReservations);
});

export {GetReservations, CancelReservation, CreateReservation,
  CompleteReservation,
  ExtendReservation,
  ManualCompleteReservation,
  scheduleReservationCompletion,
  GetActiveReservations
}