'use client';

import { useCallback, useState } from 'react';
import { useCellStore, useAuthStore } from '@/lib/store';
import type { Cell } from '@/lib/types';

// ============================================
// CELL MANAGEMENT HOOK
// ============================================
export function useCell() {
  const cellStore = useCellStore();
  const { fid, username } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a new cell
  const createCell = useCallback(async (name: string, formation: Cell['formation']) => {
    if (!fid) {
      setError('Must be authenticated to create a cell');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cell/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          formation,
          leaderFid: fid,
          leaderUsername: username
        })
      });
      
      if (!response.ok) throw new Error('Failed to create cell');
      
      const newCell: Cell = await response.json();
      cellStore.setCurrentCell(newCell);
      return newCell;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fid, username, cellStore]);
  
  // Join an existing cell
  const joinCell = useCallback(async (cellId: string, inviteCode?: string) => {
    if (!fid) {
      setError('Must be authenticated to join a cell');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cell/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cellId,
          fid,
          username,
          inviteCode
        })
      });
      
      if (!response.ok) throw new Error('Failed to join cell');
      
      const cell: Cell = await response.json();
      cellStore.addConnectedCell(cell);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fid, username, cellStore]);
  
  // Leave current cell
  const leaveCell = useCallback(async (cellId: string) => {
    if (!fid) return false;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cell/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellId, fid })
      });
      
      if (!response.ok) throw new Error('Failed to leave cell');
      
      cellStore.removeConnectedCell(cellId);
      
      if (cellStore.currentCell?.id === cellId) {
        cellStore.setCurrentCell(null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fid, cellStore]);
  
  // Fetch cell details
  const fetchCell = useCallback(async (cellId: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/cell/${cellId}`);
      
      if (!response.ok) throw new Error('Cell not found');
      
      const cell: Cell = await response.json();
      return cell;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Calculate formation power with bonuses
  const calculatePower = useCallback(() => {
    return cellStore.calculateFormationPower();
  }, [cellStore]);
  
  return {
    ...cellStore,
    isLoading,
    error,
    createCell,
    joinCell,
    leaveCell,
    fetchCell,
    calculatePower,
    isAuthenticated: !!fid
  };
}

// ============================================
// CELL INVITE HOOK
// ============================================
export function useCellInvite(cellId?: string) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateInvite = useCallback(async () => {
    if (!cellId) return null;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/cell/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellId })
      });
      
      if (!response.ok) throw new Error('Failed to generate invite');
      
      const { code } = await response.json();
      setInviteCode(code);
      return code;
    } catch (err) {
      console.error('Failed to generate invite:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [cellId]);
  
  return {
    inviteCode,
    generateInvite,
    isGenerating,
    inviteUrl: inviteCode ? `${window.location.origin}/cell/join?code=${inviteCode}` : null
  };
}
