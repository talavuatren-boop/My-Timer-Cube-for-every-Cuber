import React from 'react';
import { CubeSolverView } from './CubeSolverView';
import { ScrambleHistoryItem } from '../types/cube';

interface CubeViewProps {
  scrambleHistoryItems?: ScrambleHistoryItem[];
  onOpenScrambleHistory?: () => void;
  onUseScrambleInTimer?: (scramble: string) => void;
}

export const CubeView: React.FC<CubeViewProps> = ({
  scrambleHistoryItems = [],
  onOpenScrambleHistory,
  onUseScrambleInTimer,
}) => {
  return (
    <CubeSolverView
      scrambleHistoryItems={scrambleHistoryItems}
      onOpenScrambleHistory={onOpenScrambleHistory}
      onUseScrambleInTimer={onUseScrambleInTimer}
    />
  );
};
