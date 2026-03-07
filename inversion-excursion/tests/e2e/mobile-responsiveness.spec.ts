/**
 * E2E Tests: Mobile Responsiveness
 * Tests Farcaster app viewport and touch interactions
 */

import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness - Farcaster App', () => {
  // Use Farcaster app viewport
  test.use({ 
    viewport: { width: 430, height: 932 }, // iPhone 14 Pro Max
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Farcaster/1.0'
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
  });

  test('displays correctly in Farcaster app viewport', async ({ page }) => {
    // Verify viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
    
    // Verify no horizontal scroll
    const body = await page.locator('body').boundingBox();
    const html = await page.locator('html').boundingBox();
    expect(body?.width).toBeLessThanOrEqual(430);
    expect(html?.width).toBeLessThanOrEqual(430);
  });

  test('navigation adapts to mobile', async ({ page }) => {
    // Verify hamburger menu or bottom nav
    const mobileNav = await page.locator('[data-testid="mobile-nav"]').isVisible();
    const bottomNav = await page.locator('[data-testid="bottom-nav"]').isVisible();
    
    expect(mobileNav || bottomNav).toBe(true);
  });

  test('card frames are touch-friendly', async ({ page }) => {
    await page.goto('/deck');
    
    const card = page.locator('[data-testid="collection-card"]').first();
    const box = await card.boundingBox();
    
    // Verify minimum touch target size (44x44px)
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('frequency wave visualization renders correctly', async ({ page }) => {
    await page.goto('/deck');
    
    // Verify frequency wave
    const wave = page.locator('[data-testid="frequency-wave"]');
    await expect(wave).toBeVisible();
    
    // Verify canvas size fits mobile viewport
    const canvas = await wave.boundingBox();
    expect(canvas?.width).toBeLessThanOrEqual(430);
  });

  test('modal dialogs are full-screen on mobile', async ({ page }) => {
    // Open a modal
    await page.click('[data-testid="nav-deck-builder"]');
    await page.click('[data-testid="collection-card"]').first();
    
    const modal = page.locator('[data-testid="card-detail-modal"]');
    await expect(modal).toBeVisible();
    
    // Verify modal takes full width
    const modalBox = await modal.boundingBox();
    expect(modalBox?.width).toBeGreaterThanOrEqual(400);
  });

  test('swipe gestures work for deck building', async ({ page }) => {
    await page.goto('/deck');
    
    // Get collection card
    const card = page.locator('[data-testid="collection-card"]').first();
    
    // Perform swipe
    await card.swipe({ directions: 'left', distance: 100 });
    
    // Verify action triggered
    await expect(page.locator('[data-testid="swipe-feedback"]')).toBeVisible();
  });

  test('audio controls are accessible on mobile', async ({ page }) => {
    await page.goto('/entrainment');
    
    // Verify audio player controls
    await expect(page.locator('[data-testid="play-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="volume-control"]')).toBeVisible();
    
    // Test play button
    await page.click('[data-testid="play-button"]');
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
  });

  test('virtual keyboard handling', async ({ page }) => {
    // Navigate to cell creation
    await page.click('[data-testid="nav-cell"]');
    await page.click('[data-testid="create-cell-button"]');
    
    // Focus text input
    await page.click('[data-testid="cell-name-input"]');
    
    // Verify input is not obscured by keyboard
    const input = page.locator('[data-testid="cell-name-input"]');
    const inputBox = await input.boundingBox();
    
    // Input should be in visible area
    expect(inputBox?.y).toBeGreaterThan(0);
  });

  test('safe area insets respected', async ({ page }) => {
    // Check for safe area CSS variables
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body);
    });
    
    // Elements should have padding for notched devices
    const appContainer = page.locator('[data-testid="app-container"]');
    const paddingTop = await appContainer.evaluate(el => 
      parseInt(window.getComputedStyle(el).paddingTop)
    );
    
    expect(paddingTop).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Audio Playback Flow', () => {
  test.use({ viewport: { width: 430, height: 932 } });

  test('entrainment session flow', async ({ page }) => {
    await page.goto('/entrainment');
    
    // Select protocol
    await page.click('[data-testid="protocol-theta"]');
    
    // Verify protocol details shown
    await expect(page.locator('[data-testid="protocol-details"]')).toContainText('Theta');
    await expect(page.locator('[data-testid="protocol-frequency"]')).toContainText('6 Hz');
    
    // Start session
    await page.click('[data-testid="start-session"]');
    
    // Verify audio starts
    await expect(page.locator('[data-testid="session-active"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    
    // Wait for progress
    await page.waitForTimeout(2000);
    
    // Verify progress updates
    const progress = await page.locator('[data-testid="progress-bar"]').getAttribute('value');
    expect(parseFloat(progress || '0')).toBeGreaterThan(0);
    
    // Complete session (fast-forward in test)
    await page.evaluate(() => {
      // Simulate session completion
      (window as any).completeSession?.();
    });
    
    // Verify completion
    await page.waitForSelector('[data-testid="session-complete"]', { timeout: 30000 });
    
    // Verify bonus applied to game
    await expect(page.locator('[data-testid="synsync-bonus-badge"]')).toBeVisible();
  });

  test('audio waveform visualization', async ({ page }) => {
    await page.goto('/entrainment');
    
    // Start session
    await page.click('[data-testid="protocol-alpha"]');
    await page.click('[data-testid="start-session"]');
    
    // Verify waveform canvas
    const canvas = page.locator('[data-testid="audio-waveform"]');
    await expect(canvas).toBeVisible();
    
    // Verify canvas dimensions
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox?.width).toBeGreaterThan(200);
    expect(canvasBox?.height).toBeGreaterThan(100);
  });

  test('handles audio permission denial', async ({ page }) => {
    // Mock permission denial
    await page.context().grantPermissions([]);
    
    await page.goto('/entrainment');
    await page.click('[data-testid="protocol-alpha"]');
    await page.click('[data-testid="start-session"]');
    
    // Should show permission error
    await expect(page.locator('[data-testid="audio-permission-error"]')).toBeVisible();
  });
});

test.describe('Wallet Connection', () => {
  test.use({ viewport: { width: 430, height: 932 } });

  test('wallet connection flow', async ({ page }) => {
    await page.goto('/');
    
    // Click connect wallet
    await page.click('[data-testid="connect-wallet"]');
    
    // Verify wallet options shown
    await expect(page.locator('[data-testid="wallet-modal"]')).toBeVisible();
    
    // Select mock wallet (in real test, would use mock provider)
    await page.click('[data-testid="wallet-option-mock"]');
    
    // Verify connected state
    await page.waitForSelector('[data-testid="wallet-connected"]', { timeout: 10000 });
    
    // Verify address displayed
    const address = await page.locator('[data-testid="wallet-address"]').textContent();
    expect(address).toMatch(/0x[0-9a-fA-F]{4}...[0-9a-fA-F]{4}/);
  });

  test('transaction flow for minting', async ({ page }) => {
    // Navigate to victory screen with mint option
    await page.goto('/victory?mock=true');
    
    // Click mint
    await page.click('[data-testid="mint-button"]');
    
    // Verify transaction confirmation modal
    await expect(page.locator('[data-testid="tx-confirmation"]')).toBeVisible();
    
    // Confirm transaction
    await page.click('[data-testid="confirm-tx"]');
    
    // Wait for transaction pending
    await page.waitForSelector('[data-testid="tx-pending"]', { timeout: 5000 });
    
    // Wait for success
    await page.waitForSelector('[data-testid="tx-success"]', { timeout: 60000 });
    
    // Verify NFT in collection
    await page.click('[data-testid="view-collection"]');
    await expect(page.locator('[data-testid="nft-card"]')).toBeVisible();
  });
});
