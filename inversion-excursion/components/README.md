# The Inversion Excursion - React Components

A set of React components for The Inversion Excursion mini app built for Farcaster.

## Components

### 1. Card
Displays a game card with art, stats, frequency visualization, and tier-based styling.

**Props:**
- `card: Card` - Card data from types.ts
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Card size
- `isHighlighted?: boolean` - Highlight state
- `isSelected?: boolean` - Selection state
- `isDisabled?: boolean` - Disabled state
- `showFrequency?: boolean` - Show frequency waveform
- `showTier?: boolean` - Show tier badge
- `onClick?: () => void` - Click handler
- `onLongPress?: () => void` - Long press handler

### 2. ResonanceMeter
Visual frequency alignment indicator with multiple variants.

**Props:**
- `value: number` - Current value (0-100)
- `maxValue?: number` - Maximum value
- `label?: string` - Label text
- `showPulse?: boolean` - Show pulse animation when charged
- `isCharged?: boolean` - Charged state
- `size?: 'sm' | 'md' | 'lg'` - Size variant
- `variant?: 'linear' | 'circular' | 'wave'` - Visual style
- `segments?: number` - Number of segments for linear variant

### 3. DeckBuilder
Grid-based deck builder with drag-and-drop support for building 7-card decks.

**Props:**
- `collection: Card[]` - Available cards
- `currentDeck: Card[]` - Currently selected cards
- `maxDeckSize?: number` - Maximum deck size (default 7)
- `sharedResonance: number` - Combined resonance value
- `isLoading?: boolean` - Loading state
- `onAddCard: (card: Card) => void` - Add card callback
- `onRemoveCard: (index: number) => void` - Remove card callback
- `onReorderDeck: (fromIndex: number, toIndex: number) => void` - Reorder callback
- `onFrequencyTune: (frequency: number) => void` - Frequency tuner callback
- `onViewCardDetail: (card: Card) => void` - View card detail callback
- `onSaveDeck?: () => void` - Save deck callback

### 4. CellFormation
Cell management interface with invite functionality and shared resonance field visualization.

**Props:**
- `cell: Cell` - Cell data
- `currentUserId: string` - Current user ID
- `isLeader: boolean` - Is current user the leader
- `onInvite: () => void` - Invite callback
- `onViewMember: (member: CellMember) => void` - View member callback
- `onLeaveCell: () => void` - Leave cell callback
- `onDisbandCell?: () => void` - Disband cell callback (leader only)
- `onTransferLeadership?: (memberId: string) => void` - Transfer leadership callback

### 5. BattleInterface
Turn-based combat UI with enemy intent warnings and action bar.

**Props:**
- `battle: BattleState` - Battle state
- `currentUserId: string` - Current user ID
- `cell: Cell` - Cell data
- `isPlayerTurn: boolean` - Whether it's player's turn
- `onPlayCard: (cardId: string, targetId?: string) => void` - Play card callback
- `onSynchronize: () => void` - Synchronize callback
- `onResonanceBurst: () => void` - Resonance burst callback
- `onDefend: () => void` - Defend callback
- `onPass: () => void` - Pass turn callback
- `onConcede?: () => void` - Concede callback

### 6. SynSyncEntrainment
60-second entrainment timer with breathing circle and frequency waves.

**Props:**
- `protocol: BrainwaveProtocol` - Selected protocol
- `duration?: number` - Duration in seconds (default 60)
- `onStart?: () => void` - Start callback
- `onComplete: (result: EntrainmentResult) => void` - Complete callback
- `onCancel?: () => void` - Cancel callback
- `onProgress?: (progress: number) => void` - Progress callback

### 7. VictoryModal
Victory/defeat screen with mint functionality and share to cast.

**Props:**
- `result: 'victory' | 'defeat'` - Battle result
- `snapshot: BattleSnapshot` - Battle snapshot
- `rewards: Reward[]` - Rewards array
- `quote: string` - Victory/defeat quote
- `playerStats?: { totalDamage, resonanceContributed, cardsPlayed }` - Player stats
- `onMint: () => Promise<void>` - Mint callback
- `onShare: () => void` - Share callback
- `onPlayAgain: () => void` - Play again callback
- `onReturn: () => void` - Return callback

## Tech Stack

- **React 18+** with TypeScript
- **Tailwind CSS** for styling (dark theme)
- **Framer Motion** for 60fps animations
- **Web Audio API** for frequency generation

## Requirements Met

✅ Mobile-responsive (Farcaster mini app)  
✅ 60fps animations (Framer Motion)  
✅ 44px minimum touch targets  
✅ Accessible (ARIA labels throughout)  
✅ TypeScript interfaces from types.ts  

## Styling Reference

### Tier Colors
- **Physical**: Bronze (#D97706)
- **Emotional**: Silver (#94A3B8)
- **Atomic**: Gold (#EAB308)
- **Galactic**: Aurora Cyan (#22D3EE)
- **Cosmic**: Void Purple (#A855F7)

### Brainwave Colors
- **Delta**: #3A86FF (2Hz)
- **Theta**: #8338EC (6Hz)
- **Alpha**: #FFBE0B (10Hz)
- **Beta**: #FB5607 (20Hz)
- **Gamma**: #FF006E (40Hz)

## Usage Example

```tsx
import { Card, DeckBuilder, BattleInterface, VictoryModal } from './components';
import type { Card as CardType } from './types';

function App() {
  const [currentDeck, setCurrentDeck] = useState<CardType[]>([]);
  
  return (
    <div className="bg-gray-950 min-h-screen">
      <DeckBuilder
        collection={cardCollection}
        currentDeck={currentDeck}
        sharedResonance={calculateResonance(currentDeck)}
        onAddCard={(card) => setCurrentDeck([...currentDeck, card])}
        onRemoveCard={(index) => {
          const newDeck = [...currentDeck];
          newDeck.splice(index, 1);
          setCurrentDeck(newDeck);
        }}
      />
    </div>
  );
}
```

## File Structure

```
components/
├── Card.tsx              # Card display component
├── ResonanceMeter.tsx    # Frequency alignment meter
├── DeckBuilder.tsx       # Deck building interface
├── CellFormation.tsx     # Cell management
├── BattleInterface.tsx   # Combat UI
├── SynSyncEntrainment.tsx # 60s timer with breathing
├── VictoryModal.tsx      # Victory/defeat screen
└── index.ts              # Exports
```
