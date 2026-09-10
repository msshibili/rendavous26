import React from 'react';
import type { TeamScore } from '../../types/score';
import { Trophy, Award, Flame, Sparkles, Medal, Zap } from 'lucide-react';

interface TeamScoreboardProps {
  scores: TeamScore[];
}

export const TeamScoreboard: React.FC<TeamScoreboardProps> = ({ scores }) => {
  if (!scores || scores.length === 0) return null;

  // Sort scores descending
  const sortedScores = [...scores].sort((a, b) => b.points - a.points);
  const maxPoints = Math.max(...sortedScores.map((s) => s.points || 1), 1);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-300',
          icon: <Trophy className="w-5 h-5 fill-current text-slate-950" />,
          label: '1st Place',
        };
      case 2:
        return {
          bg: 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 shadow-md',
          icon: <Medal className="w-5 h-5 text-slate-950" />,
          label: '2nd Place',
        };
      case 3:
        return {
          bg: 'bg-gradient-to-r from-amber-700 to-amber-800 text-amber-100 shadow-md',
          icon: <Award className="w-5 h-5 text-amber-200" />,
          label: '3rd Place',
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border border-slate-700',
          icon: <Zap className="w-4 h-4 text-slate-400" />,
          label: `#${rank}`,
        };
    }
  };

  return (
    <section className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white my-8">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
            Live Points Tally • Rendezvous '26
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            Official Team Leaderboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time score updates across all stage & off-stage competitions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-emerald-400 shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Live Championship Standings</span>
        </div>
      </div>

      {/* Leaderboard Cards Grid (Responsive 2-team head-to-head or multi-team grid) */}
      <div className={`relative z-10 grid gap-6 ${
        sortedScores.length <= 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }`}>
        {sortedScores.map((team, index) => {
          const rank = index + 1;
          const badge = getRankBadge(rank);
          const percent = Math.round((team.points / maxPoints) * 100);

          return (
            <div
              key={team.id}
              className={`relative bg-slate-950/90 rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between shadow-lg ${
                rank === 1
                  ? 'border-amber-500/60 shadow-amber-500/10 ring-2 ring-amber-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Rank Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${badge.bg}`}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    {team.leadTag || `#${rank}`}
                  </span>
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-md"
                    style={{ backgroundColor: team.color || '#10B981' }}
                    title="Team Color"
                  />
                </div>
              </div>

              {/* Team Name & Main Score */}
              <div className="mb-4">
                <h3 className="text-2xl font-black text-white tracking-tight mb-1">
                  {team.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    {team.points}
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                    POINTS
                  </span>
                </div>
              </div>

              {/* Points Breakdown */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80 text-xs">
                {/* Stage vs Off-Stage */}
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-400">
                  <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-center">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Stage Score</span>
                    <span className="text-emerald-400 font-extrabold text-base">{team.stagePoints || 0}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-center">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Off-Stage</span>
                    <span className="text-blue-400 font-extrabold text-base">{team.offStagePoints || 0}</span>
                  </div>
                </div>

                {/* Lead Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Target Progress</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: team.color || '#10B981',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
