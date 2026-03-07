import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { ZORA_CONTRACTS } from '@/lib/constants';

// ============================================
// ZORA VICTORY NFT MINTING
// ============================================
export async function POST(request: NextRequest) {
  try {
    const { victory, deck, timestamp } = await request.json();

    if (!victory) {
      return NextResponse.json(
        { error: 'Only victories can be minted' },
        { status: 400 }
      );
    }

    // Generate victory metadata
    const metadata = generateVictoryMetadata(deck, timestamp);
    
    // Upload metadata to IPFS (in production, use Pinata/IPFS)
    const metadataURI = await uploadMetadata(metadata);

    // Create mint transaction data
    const mintData = await prepareMintTransaction(metadataURI, deck.length);

    return NextResponse.json({
      success: true,
      metadata,
      metadataURI,
      mintData,
      url: `https://zora.co/collect/base:${mintData.contractAddress}/${mintData.tokenId}`
    });
  } catch (error) {
    console.error('Mint error:', error);
    return NextResponse.json(
      { error: 'Failed to prepare mint' },
      { status: 500 }
    );
  }
}

function generateVictoryMetadata(deck: any[], timestamp: string) {
  const totalPower = deck.reduce((sum, card) => sum + (card.attack + card.defense), 0);
  const frequencies = deck.map(c => c.frequency);
  const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;

  return {
    name: `SynSync Victory #${Date.now()}`,
    description: `A resonant victory achieved with ${deck.length} frequency-aligned cards. Average resonance: ${avgFrequency.toFixed(0)}Hz.`,
    image: generateVictoryImage(deck),
    attributes: [
      { trait_type: 'Cards Used', value: deck.length },
      { trait_type: 'Total Power', value: totalPower },
      { trait_type: 'Avg Frequency', value: `${avgFrequency.toFixed(0)}Hz` },
      { trait_type: 'Victory Date', value: timestamp },
      { trait_type: 'Resonance Tier', value: getResonanceTier(avgFrequency) }
    ],
    properties: {
      frequencies,
      elements: [...new Set(deck.map(c => c.element))]
    }
  };
}

function generateVictoryImage(deck: any[]): string {
  // In production, this generates an SVG/PNG with the card composition
  // For now, return a placeholder that would be generated
  return `data:image/svg+xml;base64,${Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
      <rect fill="#0f0f23" width="500" height="500"/>
      <text x="250" y="200" text-anchor="middle" fill="#6366f1" font-size="24">🏆 VICTORY 🏆</text>
      <text x="250" y="280" text-anchor="middle" fill="#fff" font-size="18">${deck.length} Cards Resonated</text>
      <text x="250" y="320" text-anchor="middle" fill="#888" font-size="14">SynSync Dungeon</text>
    </svg>
  `).toString('base64')}`;
}

function getResonanceTier(avgFreq: number): string {
  if (avgFreq >= 900) return 'Cosmic';
  if (avgFreq >= 700) return 'Transcendent';
  if (avgFreq >= 500) return 'Harmonic';
  if (avgFreq >= 300) return 'Resonant';
  return 'Fundamental';
}

async function uploadMetadata(metadata: any): Promise<string> {
  // In production: upload to IPFS via Pinata or similar
  // For demo: return a data URI
  return `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;
}

async function prepareMintTransaction(metadataURI: string, cardCount: number) {
  // ERC1155 mint parameters
  const mintFee = parseEther('0.000777'); // Zora protocol fee
  const price = parseEther('0.001'); // Base price

  return {
    contractAddress: ZORA_CONTRACTS.erc1155Factory,
    tokenId: Date.now(), // Would be fetched from contract
    uri: metadataURI,
    quantity: 1,
    price: (mintFee + price).toString(),
    mintFee: mintFee.toString(),
    totalPrice: (mintFee + price).toString()
  };
}
