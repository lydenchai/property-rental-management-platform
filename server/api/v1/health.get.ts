import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/db';

export default defineEventHandler(async () => {
  let dbStatus = 'healthy';
  try {
    // Quick probe
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'degraded_in_memory_active';
  }

  return {
    status: 'ok',
    service: 'RentEase Property Rental Management Platform',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  };
});
