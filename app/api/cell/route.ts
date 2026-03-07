import { NextRequest, NextResponse } from 'next/server';
import type { Cell } from '@/lib/types';

// In-memory store for demo (use DB in production)
const cells: Map<string, Cell> = new Map();

// ============================================
// CELL MANAGEMENT API
// ============================================

// Create new cell
export async function POST(request: NextRequest) {
  try {
    const { name, formation, leaderFid, leaderUsername } = await request.json();

    if (!name || !formation || !leaderFid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cell: Cell = {
      id: crypto.randomUUID(),
      name,
      formation,
      members: [leaderUsername || leaderFid.toString()],
      cards: [],
      power: 100,
      resonanceBonus: calculateFormationBonus(formation),
      createdAt: new Date()
    };

    cells.set(cell.id, cell);

    return NextResponse.json(cell);
  } catch (error) {
    console.error('Create cell error:', error);
    return NextResponse.json(
      { error: 'Failed to create cell' },
      { status: 500 }
    );
  }
}

// Get cell by ID
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cellId = searchParams.get('id');

  if (!cellId) {
    return NextResponse.json(
      { error: 'Cell ID required' },
      { status: 400 }
    );
  }

  const cell = cells.get(cellId);
  
  if (!cell) {
    return NextResponse.json(
      { error: 'Cell not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(cell);
}

// Join cell
export async function PUT(request: NextRequest) {
  try {
    const { cellId, fid, username } = await request.json();

    const cell = cells.get(cellId);
    
    if (!cell) {
      return NextResponse.json(
        { error: 'Cell not found' },
        { status: 404 }
      );
    }

    if (cell.members.length >= 8) {
      return NextResponse.json(
        { error: 'Cell is full' },
        { status: 400 }
      );
    }

    const identifier = username || fid.toString();
    
    if (cell.members.includes(identifier)) {
      return NextResponse.json(
        { error: 'Already a member' },
        { status: 400 }
      );
    }

    cell.members.push(identifier);
    cell.power += 25; // Each member adds power
    
    cells.set(cellId, cell);

    return NextResponse.json(cell);
  } catch (error) {
    console.error('Join cell error:', error);
    return NextResponse.json(
      { error: 'Failed to join cell' },
      { status: 500 }
    );
  }
}

// Leave cell
export async function DELETE(request: NextRequest) {
  try {
    const { cellId, fid, username } = await request.json();

    const cell = cells.get(cellId);
    
    if (!cell) {
      return NextResponse.json(
        { error: 'Cell not found' },
        { status: 404 }
      );
    }

    const identifier = username || fid.toString();
    cell.members = cell.members.filter(m => m !== identifier);
    cell.power = Math.max(100, cell.power - 25);

    if (cell.members.length === 0) {
      cells.delete(cellId);
      return NextResponse.json({ deleted: true });
    }

    cells.set(cellId, cell);
    return NextResponse.json(cell);
  } catch (error) {
    console.error('Leave cell error:', error);
    return NextResponse.json(
      { error: 'Failed to leave cell' },
      { status: 500 }
    );
  }
}

function calculateFormationBonus(formation: Cell['formation']): number {
  const bonuses = {
    triangle: 20,
    square: 20,
    circle: 10,
    diamond: 15
  };
  return bonuses[formation] || 10;
}
