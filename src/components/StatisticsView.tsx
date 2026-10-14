import React, { useState, useMemo } from 'react';
import { Solve, Session } from '../types/cube';
import {
  computeSessionStats,
  computeProgressionData,
  computeTimeDistribution,
  formatTime,
} from '../lib/stats';
import { calculateAchievements } from '../lib/achievements';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Award,
  Zap,
  TrendingUp,
  BarChart2,
  Activity,
  Clock,
  Target,
  Trophy,
  CheckCircle,
  Lock,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface StatisticsViewProps {
  solves: Solve[];
  allSessionsSolves: Solve[];
  currentSession: Session;
  learningStatus?: Record<string, 'unlearned' | 'learning' | 'mastered'>;
  onOpenManageHistory?: () => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  solves,
  allSessionsSolves,
  currentSession,
  learningStatus = {},
  onOpenManageHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'progression' | 'averages' | 'pb' | 'distribution' | 'achievements'>('progression');

  const stats = useMemo(() => computeSessionStats(solves), [solves]);
  const progressionData = useMemo(() => computeProgressionData(solves), [solves]);
  const distributionData = useMemo(() => computeTimeDistribution(solves), [solves]);
  const achievements = useMemo(
    () => calculateAchievements(allSessionsSolves, learningStatus),
    [allSessionsSolves, learningStatus]
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Derived metrics
  const successRate = stats.totalCount > 0 ? Math.round((stats.validCount / stats.totalCount) * 100) : 100;
  // Estimated TPS for 3x3: standard CFOP is approx 55-60 turns.
  const estTps = stats.mean ? (55 / (stats.mean / 1000)).toFixed(2) : '--';

  // Format milliseconds duration into human readable string
  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6 text-neutral-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Analytics & Solves</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Session: <span className="text-emerald-400 font-medium">{currentSession.name}</span> ({currentSession.puzzle}) · {stats.totalCount} solves recorded
          </p>
        </div>

        {/* Quick Summary Badges & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenManageHistory && (
            <button
              onClick={onOpenManageHistory}
              title="Manage and delete solve history"
              className="px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-xs flex items-center gap-1.5 font-medium text-red-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Manage History</span>
            </button>
          )}
          <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-400">Time:</span>
            <span className="text-neutral-200 font-semibold">{formatDuration(stats.totalTimeMs)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs flex items-center gap-1.5 font-mono">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-neutral-400">Success:</span>
            <span className="text-emerald-400 font-semibold">{successRate}%</span>
          </div>
        </div>
      </div>

      {/* Primary Records Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Single PB"
          value={formatTime(stats.bestSingle)}
          highlight
          icon={<Award className="w-4 h-4 text-amber-400" />}
        />
        <StatCard
          label="Current Ao5"
          value={formatTime(stats.ao5.current)}
          best={stats.ao5.best ? formatTime(stats.ao5.best) : undefined}
          icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
        />
        <StatCard
          label="Current Ao12"
          value={formatTime(stats.ao12.current)}
          best={stats.ao12.best ? formatTime(stats.ao12.best) : undefined}
          icon={<TrendingUp className="w-4 h-4 text-indigo-400" />}
        />
        <StatCard
          label="Session Mean"
          value={formatTime(stats.mean)}
          icon={<Activity className="w-4 h-4 text-emerald-400" />}
        />
        <StatCard
          label="Est. TPS"
          value={`${estTps}`}
          sublabel="~55 turns CFOP"
          icon={<Zap className="w-4 h-4 text-amber-400" />}
        />
        <StatCard
          label="Consistency (σ)"
          value={stats.stdDev ? `${(stats.stdDev / 1000).toFixed(2)}s` : '--'}
          icon={<BarChart2 className="w-4 h-4 text-purple-400" />}
        />
      </div>

      {/* Full WCA Rolling Averages Grid */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4">
        <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">
          WCA Standard Averages (Current vs Best)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono">
          {[
            { label: 'Ao5', res: stats.ao5 },
            { label: 'Ao12', res: stats.ao12 },
            { label: 'Ao25', res: stats.ao25 },
            { label: 'Ao50', res: stats.ao50 },
            { label: 'Ao100', res: stats.ao100 },
            { label: 'Ao1000', res: stats.ao1000 },
          ].map((item) => (
            <div key={item.label} className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/50">
              <span className="text-[11px] text-neutral-500 block mb-1">{item.label}</span>
              <div className="text-sm font-bold text-neutral-200">
                {formatTime(item.res.current)}
              </div>
              <div className="text-[11px] text-emerald-400/90 mt-0.5">
                PB: {formatTime(item.res.best)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
        {/* Chart View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 text-xs overflow-x-auto scrollbar-none max-w-full">
            <button
              onClick={() => setActiveTab('progression')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap shrink-0 ${
                activeTab === 'progression'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Solve Progression
            </button>
            <button
              onClick={() => setActiveTab('averages')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap shrink-0 ${
                activeTab === 'averages'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Ao5 & Ao12 Trends
            </button>
            <button
              onClick={() => setActiveTab('pb')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap shrink-0 ${
                activeTab === 'pb'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              PB Progression
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap shrink-0 ${
                activeTab === 'distribution'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Time Distribution
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'achievements'
                  ? 'bg-neutral-800 text-amber-300 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Achievements ({unlockedCount}/{achievements.length})</span>
            </button>
          </div>

          <span className="text-xs text-neutral-400 font-mono">
            {activeTab === 'achievements' ? `${unlockedCount} unlocked` : `${progressionData.length} data points`}
          </span>
        </div>

        {/* Charts Canvas or Achievements */}
        <div className="w-full min-h-[19rem] pt-2">
          {activeTab === 'achievements' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    ach.unlocked
                      ? 'bg-amber-500/10 border-amber-500/30 text-neutral-100'
                      : 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          ach.unlocked
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {ach.unlocked ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-200">{ach.title}</h4>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                          {ach.category}
                        </span>
                      </div>
                    </div>

                    {ach.unlocked ? (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-500">Locked</span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {ach.description}
                  </p>

                  {/* Progress bar */}
                  {ach.progress && !ach.unlocked && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                        <span>Progress</span>
                        <span>
                          {ach.progress.current} / {ach.progress.total}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500/80 rounded-full transition-all"
                          style={{
                            width: `${Math.round(
                              (ach.progress.current / ach.progress.total) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : progressionData.length < 2 && activeTab !== 'distribution' ? (
            <div className="h-full min-h-[16rem] flex flex-col items-center justify-center text-center p-6 bg-neutral-950/40 rounded-2xl border border-neutral-800/40">
              <Activity className="w-8 h-8 text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-400 font-medium">No solves recorded yet in this session</p>
              <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">
                Log at least 2 solves on the Timer to generate live trendlines, Ao5 progression, and distribution charts.
              </p>
            </div>
          ) : activeTab === 'progression' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="index" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  unit="s"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: unknown) => typeof val === 'number' ? [`${val}s`, 'Time'] : [`${val}`, 'Time']}
                  labelFormatter={(lbl) => `Solve #${lbl}`}
                />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : activeTab === 'averages' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="index" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  unit="s"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ao5"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  name="Ao5"
                />
                <Line
                  type="monotone"
                  dataKey="ao12"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={false}
                  name="Ao12"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : activeTab === 'pb' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="index" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  unit="s"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: unknown) => typeof val === 'number' ? [`${val}s`, 'PB'] : [`${val}`, 'PB']}
                />
                <Line
                  type="stepAfter"
                  dataKey="pb"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#fbbf24' }}
                  name="Personal Best"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="range" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Solves" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-card for quick stats
interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  best?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sublabel, best, highlight, icon }) => {
  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all ${
        highlight
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-850/60'
      }`}
    >
      <div className="flex items-center justify-between text-neutral-400 mb-1.5">
        <span className="text-[11px] uppercase tracking-wider font-medium">{label}</span>
        {icon}
      </div>
      <div
        className={`font-mono-timer text-lg sm:text-xl font-bold tracking-tight ${
          highlight ? 'text-amber-400' : 'text-neutral-100'
        }`}
      >
        {value}
      </div>
      {best && <div className="text-[10px] font-mono text-emerald-400 mt-0.5">PB: {best}</div>}
      {sublabel && <div className="text-[10px] text-neutral-500 mt-0.5">{sublabel}</div>}
    </div>
  );
};
