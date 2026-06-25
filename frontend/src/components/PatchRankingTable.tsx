/**
 * components/PatchRankingTable.tsx
 * ---------------------------------
 * Full 10-parameter patch ranking table showing all 5 patches with
 * normalized trust metrics, rankings, and color-coded values.
 * The selected patch row is highlighted in teal.
 */

import React, { useState } from 'react';
import { AllMetricsRow, PARAM_LABELS, WEIGHTS } from '../types';

interface PatchRankingTableProps {
  patches: AllMetricsRow[];
  baselineSelected: string;
}

const PARAMS = ['T', 'S', 'C', 'H', 'A', 'B', 'R', 'X', 'L', 'M'] as const;

function MetricCell({ value }: { value: number }) {
  const cls =
    value >= 0.65 ? 'metric-high' :
    value >= 0.35 ? 'metric-mid' :
    'metric-low';
  const bg =
    value >= 0.65 ? 'bg-emerald-500/10' :
    value >= 0.35 ? 'bg-amber-500/10' :
    'bg-red-500/10';

  return (
    <td className={`px-3 py-3 text-center text-xs font-mono ${bg}`}>
      <span className={cls}>{value.toFixed(2)}</span>
    </td>
  );
}

export default function PatchRankingTable({ patches, baselineSelected }: PatchRankingTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rank' | string>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const sorted = [...patches].sort((a, b) => {
    const av = sortBy === 'rank' ? a.rank : sortBy === 'trustScore' ? a.trustScore : (a as any)[sortBy] ?? 0;
    const bv = sortBy === 'rank' ? b.rank : sortBy === 'trustScore' ? b.trustScore : (b as any)[sortBy] ?? 0;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const SortIcon = ({ col }: { col: string }) => (
    <span className={`ml-1 text-xs ${sortBy === col ? 'text-teal-400' : 'text-slate-600'}`}>
      {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
    </span>
  );

  const rankEmoji = (rank: number) =>
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  return (
    <div className="glass-card p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Patch Ranking Table</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            All 5 patches ranked by trust score — click column headers to sort
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-500/30 border border-teal-500/60" />
            TrustPatch selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-500/60" />
            Baseline selected
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700">
              <th
                className="px-3 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 whitespace-nowrap"
                onClick={() => handleSort('rank')}
              >
                Rank <SortIcon col="rank" />
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Patch
              </th>
              <th
                className="px-3 py-3 text-center text-xs font-bold text-teal-400 uppercase tracking-wider cursor-pointer hover:text-teal-300 whitespace-nowrap"
                onClick={() => handleSort('trustScore')}
              >
                Trust Score <SortIcon col="trustScore" />
              </th>
              {PARAMS.map(p => (
                <th
                  key={p}
                  className="px-3 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 whitespace-nowrap"
                  onClick={() => handleSort(p)}
                  title={PARAM_LABELS[p]}
                >
                  {p} <span className="font-normal text-slate-700">({(WEIGHTS[p] * 100).toFixed(0)}%)</span>
                  <SortIcon col={p} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sorted.map((patch) => {
              const isTrustSelected = patch.selected;
              const isBaselineSelected = patch.patchId === baselineSelected;
              const isTestGaming = (patch as any).isTestGaming;

              return (
                <tr
                  key={patch.patchId}
                  onMouseEnter={() => setHoveredRow(patch.patchId)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`
                    transition-all duration-150 cursor-default
                    ${isTrustSelected
                      ? 'bg-teal-500/10 border-l-2 border-l-teal-500'
                      : isBaselineSelected && isTestGaming
                      ? 'bg-red-500/8 border-l-2 border-l-red-500'
                      : isBaselineSelected
                      ? 'bg-indigo-500/8 border-l-2 border-l-indigo-500/50'
                      : hoveredRow === patch.patchId
                      ? 'bg-slate-800/50'
                      : 'bg-transparent'
                    }
                  `}
                >
                  <td className="px-3 py-3 text-center text-lg">
                    {rankEmoji(patch.rank)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-base ${
                        isTrustSelected ? 'text-teal-400' :
                        isBaselineSelected ? 'text-red-400' : 'text-slate-300'
                      }`}>
                        {patch.patchId}
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {isTrustSelected && (
                          <span className="text-xs bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded-full border border-teal-500/30">
                            ✓ TAPR
                          </span>
                        )}
                        {isBaselineSelected && (patch as any).isTestGaming && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/30 animate-pulse">
                            ⚠ TRAP
                          </span>
                        )}
                        {isBaselineSelected && !(patch as any).isTestGaming && (
                          <span className="text-xs bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/30">
                            BAPR
                          </span>
                        )}
                      </div>
                    </div>
                    {(patch as any).isTestGaming && (
                      <p className="text-xs text-red-400/60 mt-0.5">Test-gaming anti-pattern</p>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-base font-black ${
                        isTrustSelected ? 'text-teal-400' : 'text-slate-300'
                      }`}>
                        {patch.trustScore.toFixed(3)}
                      </span>
                      <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isTrustSelected ? 'bg-teal-400' : 'bg-slate-500'}`}
                          style={{ width: `${patch.trustScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  {PARAMS.map(p => (
                    <MetricCell key={p} value={patch[p]} />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="text-emerald-400">■</span> High (≥ 0.65)</span>
        <span className="flex items-center gap-1"><span className="text-amber-400">■</span> Medium (0.35–0.65)</span>
        <span className="flex items-center gap-1"><span className="text-red-400">■</span> Low (&lt; 0.35)</span>
        <span className="ml-auto">Weights shown in parentheses — normalized to [0,1]</span>
      </div>
    </div>
  );
}
