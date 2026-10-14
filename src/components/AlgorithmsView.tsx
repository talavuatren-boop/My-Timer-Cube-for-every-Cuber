import React, { useState, useMemo } from 'react';
import { AlgorithmCase } from '../types/cube';
import { ALGORITHM_DATABASE } from '../lib/algorithmsData';
import {
  loadCustomCases,
  saveCustomCases,
  loadCommunityCases,
  saveCommunityCases,
} from '../lib/storage';
import { CubeDiagram } from './CubeDiagram';
import { CaseDetailModal } from './CaseDetailModal';
import { CaseEditorModal } from './CaseEditorModal';
import {
  Search,
  Star,
  Plus,
  Shuffle,
  Users,
  User,
  Filter,
  Sparkles,
  Heart,
  Copy,
  Trash2,
  Share2,
  ExternalLink,
  Check,
} from 'lucide-react';

interface AlgorithmsViewProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  learningStatus: Record<string, 'unlearned' | 'learning' | 'mastered'>;
  onUpdateLearningStatus: (id: string, status: 'unlearned' | 'learning' | 'mastered') => void;
}

export const AlgorithmsView: React.FC<AlgorithmsViewProps> = ({
  favorites,
  onToggleFavorite,
  learningStatus,
  onUpdateLearningStatus,
}) => {
  const [category, setCategory] = useState<
    'all' | 'cross' | 'f2l' | 'oll' | 'pll' | '2look-oll' | '2look-pll' | 'custom' | 'community'
  >('pll');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unlearned' | 'learning' | 'mastered'>('all');

  // Custom and Community storage
  const [customCases, setCustomCases] = useState<AlgorithmCase[]>(loadCustomCases);
  const [communityCases, setCommunityCases] = useState<AlgorithmCase[]>(loadCommunityCases);

  // Modals state
  const [selectedCaseModal, setSelectedCaseModal] = useState<AlgorithmCase | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<AlgorithmCase | null>(null);

  // Combine full database with guaranteed unique IDs
  const fullDatabase = useMemo(() => {
    const seen = new Set<string>();
    const list: AlgorithmCase[] = [];
    for (const item of [...ALGORITHM_DATABASE, ...customCases, ...communityCases]) {
      let uniqueId = item.id;
      let counter = 1;
      while (seen.has(uniqueId)) {
        uniqueId = `${item.id}_${item.category}_${counter++}`;
      }
      seen.add(uniqueId);
      list.push(item.id === uniqueId ? item : { ...item, id: uniqueId });
    }
    return list;
  }, [customCases, communityCases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return fullDatabase.filter((item) => {
      // Category filter
      if (category !== 'all') {
        if (category === 'custom') {
          if (!item.isCustom) return false;
        } else if (category === 'community') {
          if (item.category !== 'community') return false;
        } else {
          if (item.category !== category) return false;
        }
      }

      // Favorites filter
      if (onlyFavorites && !favorites.includes(item.id)) return false;

      // Learning status filter
      if (filterStatus !== 'all') {
        const st = learningStatus[item.id] || 'unlearned';
        if (st !== filterStatus) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAlg = item.algorithm.toLowerCase().includes(q);
        const matchesGroup = item.group?.toLowerCase().includes(q);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesAlg && !matchesGroup && !matchesTags) return false;
      }

      return true;
    });
  }, [fullDatabase, category, onlyFavorites, filterStatus, searchQuery, favorites, learningStatus]);

  // Handle Pick Random Case
  const handlePickRandom = () => {
    if (filteredCases.length > 0) {
      const chosen = filteredCases[Math.floor(Math.random() * filteredCases.length)];
      setSelectedCaseModal(chosen);
    }
  };

  // Handle Saving Custom Case
  const handleSaveCustomCase = (newCase: AlgorithmCase) => {
    let updated: AlgorithmCase[];
    const exists = customCases.some((c) => c.id === newCase.id);
    if (exists) {
      updated = customCases.map((c) => (c.id === newCase.id ? newCase : c));
    } else {
      updated = [newCase, ...customCases];
    }

    setCustomCases(updated);
    saveCustomCases(updated);

    // If marked public, publish to community as well
    if (newCase.isPublic) {
      const commId = newCase.id.startsWith('comm_') ? newCase.id : `comm_${newCase.id}`;
      const commCopy: AlgorithmCase = {
        ...newCase,
        id: commId,
        category: 'community',
        subCategory: (newCase.subCategory || newCase.category) as any,
        author: 'You',
        likesCount: 1,
      };
      const commUpdated = [commCopy, ...communityCases.filter((c) => c.id !== commId && c.id !== newCase.id)];
      setCommunityCases(commUpdated);
      saveCommunityCases(commUpdated);
    }
  };

  // Handle Deleting Custom Case
  const handleDeleteCustomCase = (id: string) => {
    const updated = customCases.filter((c) => c.id !== id);
    setCustomCases(updated);
    saveCustomCases(updated);

    // Also remove any linked community copy
    const commId = `comm_${id}`;
    const commUpdated = communityCases.filter((c) => c.id !== id && c.id !== commId);
    if (commUpdated.length !== communityCases.length) {
      setCommunityCases(commUpdated);
      saveCommunityCases(commUpdated);
    }
  };

  // Copy Community case into My Cases
  const handleCopyCommunityCase = (item: AlgorithmCase) => {
    const customCopy: AlgorithmCase = {
      ...item,
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      category: 'custom',
      isCustom: true,
      name: `${item.name} (Copy)`,
      author: 'Saved from Community',
      createdAt: Date.now(),
    };
    handleSaveCustomCase(customCopy);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6 text-neutral-100">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">CFOP & Case Library</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Verified speedcubing algorithms, custom case creator, and authentic top-layer recognition diagrams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingCase(null);
              setIsEditorOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Case</span>
          </button>

          <button
            onClick={handlePickRandom}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-medium text-neutral-200 flex items-center gap-1.5 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-teal-400" />
            <span>Random Case</span>
          </button>
        </div>
      </div>

      {/* Categories Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900/60 rounded-2xl border border-neutral-800 text-xs overflow-x-auto scrollbar-none max-w-full">
          {[
            { id: 'all', label: 'All Cases' },
            { id: 'cross', label: 'Cross' },
            { id: 'f2l', label: 'F2L (41)' },
            { id: 'oll', label: 'OLL (57)' },
            { id: 'pll', label: 'PLL (21)' },
            { id: 'zbll', label: 'ZBLL (472)' },
            { id: '2look-oll', label: '2-Look OLL' },
            { id: '2look-pll', label: '2-Look PLL' },
            { id: 'custom', label: `My Cases (${customCases.length})` },
            { id: 'community', label: `Community (${communityCases.length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap shrink-0 ${
                category === cat.id
                  ? 'bg-neutral-800 text-teal-300 font-bold border border-teal-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search, Status & Favorites Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case name, notation, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300 outline-hidden focus:border-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="unlearned">Unlearned</option>
              <option value="learning">Learning</option>
              <option value="mastered">Mastered</option>
            </select>

            {/* Favorite toggle */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              title="Show Favorites Only"
              className={`p-2 rounded-xl border transition-colors ${
                onlyFavorites
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Case Grid */}
      {filteredCases.length === 0 ? (
        <div className="py-16 text-center text-xs text-neutral-500 bg-neutral-900/30 rounded-3xl border border-neutral-800/80">
          No cases match your filters. Try a different category or search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCases.map((alg, index) => {
            const isFav = favorites.includes(alg.id);
            const status = learningStatus[alg.id] || 'unlearned';

            return (
              <div
                key={`${alg.id}-${alg.category}-${index}`}
                onClick={() => setSelectedCaseModal(alg)}
                className="group bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/90 rounded-2xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all shadow-sm hover:shadow-md hover:bg-neutral-850/50"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-neutral-100 group-hover:text-teal-400 transition-colors block">
                      {alg.name}
                    </span>
                    {alg.group && (
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {alg.group}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {alg.isCustom && (
                      <button
                        onClick={() => handleDeleteCustomCase(alg.id)}
                        className="p-1 text-neutral-500 hover:text-red-400 rounded transition-colors"
                        title="Delete custom case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onToggleFavorite(alg.id)}
                      className="p-1 text-neutral-500 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${isFav ? 'text-amber-400 fill-current' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Center Visual Diagram & Notation */}
                <div className="flex items-center gap-3.5">
                  <CubeDiagram caseData={alg} size={70} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-neutral-200 line-clamp-2 leading-relaxed">
                      {alg.algorithm}
                    </p>
                    {alg.alternativeAlgorithms && alg.alternativeAlgorithms.length > 0 && (
                      <span className="text-[10px] text-neutral-500 mt-0.5 block">
                        +{alg.alternativeAlgorithms.length} alternative algs
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Pill Details */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-neutral-800/60">
                  <span
                    className={`capitalize font-medium ${
                      status === 'mastered'
                        ? 'text-emerald-400'
                        : status === 'learning'
                        ? 'text-amber-400'
                        : 'text-neutral-500'
                    }`}
                  >
                    ● {status}
                  </span>

                  {alg.author && (
                    <span className="text-neutral-500 text-[10px] truncate max-w-[120px]">
                      By {alg.author}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Case Detail Modal */}
      <CaseDetailModal
        caseData={selectedCaseModal}
        onClose={() => setSelectedCaseModal(null)}
        isFavorite={selectedCaseModal ? favorites.includes(selectedCaseModal.id) : false}
        onToggleFavorite={onToggleFavorite}
        learningStatus={
          selectedCaseModal ? learningStatus[selectedCaseModal.id] || 'unlearned' : 'unlearned'
        }
        onUpdateLearningStatus={onUpdateLearningStatus}
        onCopyCaseToMyCases={handleCopyCommunityCase}
        onEditCase={(c) => {
          setEditingCase(c);
          setIsEditorOpen(true);
        }}
      />

      {/* Custom Case Editor Modal */}
      <CaseEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingCase(null);
        }}
        onSaveCase={handleSaveCustomCase}
        initialCase={editingCase}
      />
    </div>
  );
};
