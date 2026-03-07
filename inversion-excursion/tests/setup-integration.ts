/**
 * Integration test setup
 * Sets up database connection and test fixtures
 */

import { jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'file:./test.db',
    },
  },
});

// Global setup for integration tests
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Run migrations if needed
  // await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data
  const tables = ['BattleAction', 'BattleCard', 'Battle', 'CellMember', 'Cell', 'Card', 'Player'];
  
  for (const table of tables) {
    try {
      await (prisma as any)[table].deleteMany({});
    } catch (e) {
      // Table might not exist
    }
  }
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Export prisma for use in tests
export { prisma };
