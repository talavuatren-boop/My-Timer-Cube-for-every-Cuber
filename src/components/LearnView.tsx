import React, { useState } from 'react';
import { AlgorithmsView } from './AlgorithmsView';
import { TrainingView } from './TrainingView';
import { AppSettings } from '../types/cube';
import { BookOpen, Dumbbell, Sparkles } from 'lucide-react';

interface LearnViewProps {
  settings: AppSettings;
  activeSessionId: string;
  favorites: string[];
  onToggleFavorite: (caseId: string) => void;
  learningStatus: Record<string, 'unlearned' | 'learning' | 'mastered'>;
  onUpdateLearningStatus: (caseId: string, status: 'unlearned' | 'learning' | 'mastered') => void;
  initialSubTab?: 'algorithms' | 'training';
}

export const LearnView: React.FC<LearnViewProps> = ({
  settings,
  activeSessionId,
  favorites,
  onToggleFavorite,
  learningStatus,
  onUpdateLearningStatus,
  initialSubTab = 'algorithms',
}) => {
  const [subTab, setSubTab] = useState<'algorithms' | 'training'>(initialSubTab);

  return (
    <div className="w-full flex flex-col">
      {/* Top Segmented Sub-Navigation Switcher */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 pt-3 pb-1">
        <div className="flex items-center justify-between flex-wrap gap-2 bg-neutral-900/90 border border-neutral-800 p-1.5 sm:p-2 rounded-2xl shadow-md">
          {/* Sub-Tabs: Algorithms vs Drills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <button
              onClick={() => setSubTab('algorithms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                subTab === 'algorithms'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Algorithm Library</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                472+ ZBLL
              </span>
            </button>

            <button
              onClick={() => setSubTab('training')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                subTab === 'training'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Drills &amp; Practice</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-400 font-mono hidden md:flex items-center gap-1.5 px-2">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Master CFOP &amp; 1-Look ZBLL</span>
          </div>
        </div>
      </div>

      {/* Render Active View */}
      {subTab === 'algorithms' ? (
        <AlgorithmsView
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          learningStatus={learningStatus}
          onUpdateLearningStatus={onUpdateLearningStatus}
        />
      ) : (
        <TrainingView settings={settings} activeSessionId={activeSessionId} />
      )}
    </div>
  );
};
