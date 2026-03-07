import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResonanceMeter } from './ResonanceMeter';
import type { Cell, CellMember, ResonanceField } from '../types';

interface CellFormationProps {
  cell: Cell;
  currentUserId: string;
  isLeader: boolean;
  onInvite: () => void;
  onViewMember: (member: CellMember) => void;
  onLeaveCell: () => void;
  onDisbandCell?: () => void;
  onTransferLeadership?: (memberId: string) => void;
  className?: string;
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  in_battle: 'bg-amber-500',
};

const statusLabels = {
  online: 'Online',
  offline: 'Offline',
  in_battle: 'In Battle',
};

// Calculate position for member in pentagonal formation
const getMemberPosition = (index: number, total: number, radius: number) => {
  const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
};

export const CellFormation: React.FC<CellFormationProps> = ({
  cell,
  currentUserId,
  isLeader,
  onInvite,
  onViewMember,
  onLeaveCell,
  onDisbandCell,
  onTransferLeadership,
  className = '',
}) => {
  const [selectedMember, setSelectedMember] = useState<CellMember | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Calculate cell resonance
  const cellResonance = useMemo(() => {
    const onlineMembers = cell.members.filter((m) => m.status === 'online');
    if (onlineMembers.length === 0) return 0;

    const avgResonance = onlineMembers.reduce((sum, m) => sum + m.deckResonance, 0) / onlineMembers.length;
    const fieldStrength = (onlineMembers.length / cell.maxMembers) * 100;

    return {
      combinedFrequency: cell.sharedField.combinedFrequency,
      fieldStrength,
      avgResonance,
      onlineCount: onlineMembers.length,
    };
  }, [cell.members, cell.maxMembers, cell.sharedField.combinedFrequency]);

  // Member positions for visual formation
  const memberPositions = useMemo(() => {
    const onlineMembers = cell.members.filter((m) => m.status !== 'offline');
    const radius = 80;

    return onlineMembers.map((member, index) => ({
      member,
      position: getMemberPosition(index, Math.max(onlineMembers.length, 3), radius),
    }));
  }, [cell.members]);

  // Copy invite code
  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(cell.inviteCode);
      // Could show toast here
    } catch (err) {
      console.error('Failed to copy invite code:', err);
    }
  };

  const currentMember = cell.members.find((m) => m.id === currentUserId);

  return (
    <div className={`flex flex-col h-full bg-gray-950 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-800">
        <div>
          <h1 className="text-lg font-semibold text-white">{cell.name}</h1>
          <p className="text-xs text-gray-400">Code: {cell.inviteCode}</p>
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px]"
          aria-label="Cell options"
          aria-expanded={showMenu}
        >
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Options Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-14 right-4 bg-gray-800 rounded-lg shadow-xl z-50 min-w-[200px] border border-gray-700"
            >
              <button
                onClick={handleCopyInvite}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700 first:rounded-t-lg transition-colors min-h-[44px]"
              >
                Copy Invite Code
              </button>
              {isLeader && onDisbandCell && (
                <button
                  onClick={() => {
                    onDisbandCell();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-gray-700 last:rounded-b-lg transition-colors min-h-[44px]"
                >
                  Disband Cell
                </button>
              )}
              {!isLeader && (
                <button
                  onClick={() => {
                    onLeaveCell();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-gray-700 last:rounded-b-lg transition-colors min-h-[44px]"
                >
                  Leave Cell
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Shared Resonance Field Visualization */}
      <div className="relative h-64 bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
        {/* Background field effect */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div
            className="w-48 h-48 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)`,
            }}
          />
        </motion.div>

        {/* Central Resonance Field */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-900/50 to-purple-900/30 border border-violet-500/30 flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 20px rgba(139, 92, 246, 0.2)',
                '0 0 40px rgba(139, 92, 246, 0.4)',
                '0 0 20px rgba(139, 92, 246, 0.2)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-violet-300">
                {cellResonance.combinedFrequency.toFixed(1)}
              </div>
              <div className="text-[10px] text-violet-400">Hz</div>
            </div>

            {/* Orbiting particles */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-violet-400"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  originX: '50%',
                  originY: '50%',
                  transform: `rotate(${i * 120}deg) translateX(60px)`,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Member positions in formation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
003e
          {memberPositions.map(({ member, position }) => (
            <motion.button
              key={member.id}
              className="absolute pointer-events-auto"
              style={{
                x: position.x,
                y: position.y,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => {
                setSelectedMember(member);
                onViewMember?.(member);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`${member.displayName}, ${statusLabels[member.status]}`}
            >
              <div className="relative">
                {/* Connection line to center */}
                <svg
                  className="absolute top-1/2 left-1/2 w-full h-full pointer-events-none"
                  style={{
                    width: Math.abs(position.x) * 2 + 48,
                    height: Math.abs(position.y) * 2 + 48,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <line
                    x1="50%"
                    y1="50%"
                    x2={position.x > 0 ? '0%' : '100%'}
                    y2={position.y > 0 ? '0%' : '100%'}
                    stroke="rgba(139, 92, 246, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;12"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </line>
                </svg>

                {/* Avatar */}
                <div className={`
                  w-12 h-12 rounded-full overflow-hidden border-2
                  ${member.id === currentUserId ? 'border-violet-400' : 'border-gray-600'}
                  relative
                `}>
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-400">
                        {member.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Status indicator */}
                  <div className={`
                    absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900
                    ${statusColors[member.status]}
                  `} />
                </div>

                {/* Name label */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`
                    text-[10px] px-1.5 py-0.5 rounded-full
                    ${member.id === currentUserId ? 'bg-violet-500/30 text-violet-300' : 'bg-gray-800 text-gray-400'}
                  `}>
                    {member.displayName.length > 10
                      ? member.displayName.slice(0, 8) + '...'
                      : member.displayName}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Resonance Stats */}
      <div className="px-4 py-3 bg-gray-900/30">
        <ResonanceMeter
          value={cellResonance.fieldStrength}
          label="Field Strength"
          size="sm"
          variant="linear"
          segments={7}
        />
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400">Members</div>
            <div className="text-sm font-mono text-white">
              {cell.members.length}/{cell.maxMembers}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400">Online</div>
            <div className="text-sm font-mono text-green-400">
              {cellResonance.onlineCount}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400">Avg Res</div>
            <div className="text-sm font-mono text-amber-400">
              {Math.round(cellResonance.avgResonance)}%
            </div>
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Cell Members ({cell.members.length})
        </div>

        <div className="space-y-2">
          {cell.members.map((member) => (
            <motion.div
              key={member.id}
              className={`
                flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg
                hover:bg-gray-800/50 transition-colors cursor-pointer
                ${member.id === currentUserId ? 'border border-violet-500/30' : ''}
              `}
              onClick={() => onViewMember?.(member)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              role="button"
              aria-label={`View ${member.displayName}'s profile`}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-400">
                        {member.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`
                  absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900
                  ${statusColors[member.status]}
                `} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {member.displayName}
                  </span>
                  {member.id === cell.leaderId && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                      Leader
                    </span>
                  )}
                  {member.id === currentUserId && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{member.deckResonance.toFixed(1)}Hz</span>
                  <span className={`
                    ${member.status === 'online' ? 'text-green-400' : ''}
                    ${member.status === 'in_battle' ? 'text-amber-400' : ''}
                  `}>
                    {statusLabels[member.status]}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {isLeader && member.id !== currentUserId && onTransferLeadership && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTransferLeadership(member.id);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-amber-400 transition-colors min-w-[36px] min-h-[36px]"
                    aria-label={`Make ${member.displayName} leader`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </button>
                )}
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Invite Button */}
      <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-800">
        <button
          onClick={onInvite}
          disabled={cell.members.length >= cell.maxMembers}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          aria-label="Invite friend to cell"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {cell.members.length >= cell.maxMembers ? 'Cell Full' : 'Invite Friend'}
        </button>
      </div>
    </div>
  );
};

export default CellFormation;
