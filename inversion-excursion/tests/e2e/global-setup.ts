/**
 * Playwright Global Setup
 * Runs before all tests
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Start test server if needed
  console.log('Setting up E2E test environment...');
  
  // Create browser for authentication
  const browser = await chromium.launch();
  
  // Create test user authentication state
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to app
  await page.goto(process.env.BASE_URL || 'http://localhost:3000');
  
  // Perform authentication (if needed)
  // This creates a storage state file that tests can reuse
  
  // Save authentication state
  await context.storageState({ path: './tests/e2e/auth.json' });
  
  await browser.close();
  
  console.log('E2E test environment ready');
}

export default globalSetup;
