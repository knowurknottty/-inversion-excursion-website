/**
 * E2E Tests: Full Game Loop
 * Tests the complete user journey: build deck → form cell → battle → mint
 */

import { test, expect } from '@playwright/test';

test.describe('Full Game Loop', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
  });

  test('complete game flow: deck building → cell formation → battle → mint', async ({ page }) => {
    // ============ STEP 1: BUILD DECK ============
    
    // Navigate to deck builder
    await page.click('[data-testid="nav-deck-builder"]');
    await page.waitForURL('**/deck');
    
    // Verify deck builder loaded
    await expect(page.locator('[data-testid="deck-builder"]')).toBeVisible();
    
    // Select cards from collection
    const cards = await page.locator('[data-testid="collection-card"]').all();
    expect(cards.length).toBeGreaterThan(0);
    
    // Add 3 cards to deck
    for (let i = 0; i < 3; i++) {
      await cards[i].click();
      await expect(cards[i]).toHaveClass(/selected/);
    }
    
    // Verify deck has 3 cards
    const deckCards = await page.locator('[data-testid="deck-card"]').all();
    expect(deckCards.length).toBe(3);
    
    // Set frequency tune (Alpha for this deck)
    await page.click('[data-testid="frequency-selector-alpha"]');
    await expect(page.locator('[data-testid="frequency-display"]')).toContainText('10.5 Hz');
    
    // Save deck
    await page.click('[data-testid="save-deck-button"]');
    await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
    
    // ============ STEP 2: FORM CELL ============
    
    // Navigate to cell formation
    await page.click('[data-testid="nav-cell"]');
    await page.waitForURL('**/cell');
    
    // Create new cell
    await page.click('[data-testid="create-cell-button"]');
    
    // Fill cell details
    await page.fill('[data-testid="cell-name-input"]', 'Test Cell E2E');
    await page.fill('[data-testid="cell-description-input"]', 'Created by E2E test');
    
    // Submit cell creation
    await page.click('[data-testid="submit-cell-button"]');
    
    // Wait for cell to be created
    await page.waitForSelector('[data-testid="cell-created"]', { timeout: 10000 });
    
    // Verify invite code is generated
    const inviteCode = await page.locator('[data-testid="invite-code"]').textContent();
    expect(inviteCode).toBeTruthy();
    expect(inviteCode?.length).toBeGreaterThan(5);
    
    // Copy invite code (simulate)
    await page.click('[data-testid="copy-invite-code"]');
    
    // ============ STEP 3: START BATTLE ============
    
    // Navigate to battle
    await page.click('[data-testid="nav-battle"]');
    await page.waitForURL('**/battle');
    
    // Start new battle
    await page.click('[data-testid="start-battle-button"]');
    
    // Wait for battle to load
    await page.waitForSelector('[data-testid="battle-interface"]', { timeout: 15000 });
    
    // Verify enemy is displayed
    await expect(page.locator('[data-testid="enemy-avatar"]')).toBeVisible();
    await expect(page.locator('[data-testid="enemy-health"]')).toBeVisible();
    
    // Verify player's cards are available
    await expect(page.locator('[data-testid="battle-hand-card"]').first()).toBeVisible();
    
    // ============ STEP 4: PLAY TURNS ============
    
    // Play a few turns
    for (let turn = 0; turn < 3; turn++) {
      // Wait for player turn indicator
      await page.waitForSelector('[data-testid="player-turn-indicator"]', { timeout: 5000 });
      
      // Play a card
      const handCards = await page.locator('[data-testid="battle-hand-card"]').all();
      if (handCards.length > 0) {
        await handCards[0].click();
        
        // Select attack action
        await page.click('[data-testid="action-attack"]');
        
        // Confirm action
        await page.click('[data-testid="confirm-action"]');
        
        // Wait for animation
        await page.waitForTimeout(1000);
      }
      
      // Wait for turn to complete
      await page.waitForTimeout(2000);
    }
    
    // ============ STEP 5: SYNCHRONIZE ============
    
    // Open sync modal
    await page.click('[data-testid="sync-button"]');
    await expect(page.locator('[data-testid="sync-modal"]')).toBeVisible();
    
    // Select protocol
    await page.click('[data-testid="protocol-alpha"]');
    
    // Start entrainment
    await page.click('[data-testid="start-entrainment"]');
    
    // Wait for entrainment to complete (simulated shorter duration)
    await page.waitForSelector('[data-testid="entrainment-complete"]', { timeout: 30000 });
    
    // Verify sync bonus applied
    await expect(page.locator('[data-testid="sync-bonus-active"]')).toBeVisible();
    
    // ============ STEP 6: WIN BATTLE ============
    
    // Continue playing until victory (or simulate)
    // In real test, we'd play full battle; here we simulate victory state
    
    // Wait for victory screen
    await page.waitForSelector('[data-testid="victory-screen"]', { timeout: 60000 });
    
    // Verify victory rewards
    await expect(page.locator('[data-testid="victory-rewards"]')).toBeVisible();
    await expect(page.locator('[data-testid="victory-quote"]')).toBeVisible();
    
    // ============ STEP 7: MINT VICTORY ============
    
    // Click mint button
    await page.click('[data-testid="mint-button"]');
    
    // Wait for mint modal
    await page.waitForSelector('[data-testid="mint-modal"]', { timeout: 10000 });
    
    // Verify mint preview
    await expect(page.locator('[data-testid="mint-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="mint-card-name"]')).toContainText('CITATION REQUIRED');
    
    // Confirm mint (would trigger wallet in real scenario)
    await page.click('[data-testid="confirm-mint"]');
    
    // Wait for mint success
    await page.waitForSelector('[data-testid="mint-success"]', { timeout: 60000 });
    
    // Verify success message
    await expect(page.locator('[data-testid="mint-success-message"]')).toContainText('Successfully minted');
    
    // Verify transaction link
    await expect(page.locator('[data-testid="tx-link"]')).toHaveAttribute('href', /basescan/);
  });
});

test.describe('Mobile Game Flow', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

  test('mobile deck building experience', async ({ page }) => {
    await page.goto('/deck');
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-deck-builder"]')).toBeVisible();
    
    // Test swipe gestures (if applicable)
    const card = page.locator('[data-testid="collection-card"]').first();
    
    // Swipe to add to deck
    await card.dragTo(page.locator('[data-testid="deck-drop-zone"]'));
    
    // Verify card added
    await expect(page.locator('[data-testid="deck-card-count"]')).toContainText('1');
  });

  test('mobile battle interface', async ({ page }) => {
    // Start battle
    await page.goto('/battle');
    await page.click('[data-testid="start-battle-button"]');
    
    // Wait for battle
    await page.waitForSelector('[data-testid="battle-interface"]');
    
    // Verify mobile-optimized layout
    await expect(page.locator('[data-testid="mobile-battle-layout"]')).toBeVisible();
    
    // Test touch interactions
    const card = page.locator('[data-testid="battle-hand-card"]').first();
    await card.tap();
    
    // Verify action menu appears
    await expect(page.locator('[data-testid="action-menu"]')).toBeVisible();
  });
});
