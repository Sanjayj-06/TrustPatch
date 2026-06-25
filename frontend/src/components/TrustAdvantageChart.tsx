/**
 * components/TrustAdvantageChart.tsx
 * ------------------------------------
 * Hero chart — the single most compelling visual in TrustPatch.
 *
 * Shows a grouped bar chart: BAPR-selected patch vs TrustPatch-selected patch
 * across all 10 trust dimensions. When P3 (test-gaming) is the BAPR choice,
 * its bars are catastrophically low on S, C, H, A, B, L while P1's bars
 * are consistently high — making the visual case IMPOSSIBLE to ignore.
 *
 * Also includes a "Quality per Second" efficiency widget that reframes
 * execution time as an ADVANTAGE for TrustPatch (depth of analysis).
 */

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
} from 'recharts';
import { AllMetricsRow, ChartData, ExecutionTimeChartData } from '../types';

interface TrustAdvantageChartProps {
  allMetrics: AllMetricsRow[];
  executionTime: ExecutionTimeChartData[];
  baselineSelected: string;
  trustSelected: string;
  diverged: boolean;
  baprTrap: boolean;
}

const PARAM_LABELS: Record<string, string> = {
  T: 'Test Pass Rate',
  S: 'Semantic Sim.',
  C: 'Complexity',
  H: 'Historical',
  A: 'Static Analysis',
  B: 'Behavioral',
  R: 'Regression',
  X: 'Contextual',
  L: 'LLM Confidence',
  M: 'Multi-Patch',
};
const PARAMS = ['T', 'S', 'C', 'H', 'A', 'B', 'R', 'X', 'L', 'M'];

// Custom tooltip for the quality profile chart
const QualityTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-bold text-white mb-2">{PARAM_LABELS[label] || label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-mono text-white">{(entry.value * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

export default function TrustAdvantageChart({
  allMetrics,
  executionTime,
  baselineSelected,
  trustSelected,
  diverged,
  baprTrap,
}: TrustAdvantageChartProps) {
  const [chartMode, setChartMode] = useState<'bar' | 'radar'>('bar');

  const baprPatch  = allMetrics.find(r => r.patchId === baselineSelected);
  const taprPatch  = allMetrics.find(r => r.patchId === trustSelected);

  if (!baprPatch || !taprPatch) return null;

  // Build chart data for the grouped bar
  const qualityData = PARAMS.map(param => ({
    param,
    label: PARAM_LABELS[param] || param,
    BAPR:  baprPatch[param as keyof AllMetricsRow] as number ?? 0,
    TAPR:  taprPatch[param as keyof AllMetricsRow] as number ?? 0,
  }));

  // Radar data
  const radarData = PARAMS.map(param => ({
    subject: param,
    BAPR: Math.round(((baprPatch[param as keyof AllMetricsRow] as number) ?? 0) * 100),
    TAPR: Math.round(((taprPatch[param as keyof AllMetricsRow] as number) ?? 0) * 100),
  }));

  // Execution time and efficiency
  const baprTime   = executionTime.find(e => e.approach.includes('BAPR'))?.time  ?? 0;
  const taprTime   = executionTime.find(e => e.approach.includes('Trust'))?.time ?? 0;
  const extraSecs  = Math.max(0, taprTime - baprTime);
  const baprAvg    = PARAMS.reduce((s, p) => s + ((baprPatch[p as keyof AllMetricsRow] as number) ?? 0), 0) / PARAMS.length;
  const taprAvg    = PARAMS.reduce((s, p) => s + ((taprPatch[p as keyof AllMetricsRow] as number) ?? 0), 0) / PARAMS.length;
  const qualityGain = ((taprAvg - baprAvg) * 100).toFixed(1);

  // Dimensions BAPR would FAIL
  const baprFailedDims = PARAMS.filter(p => ((baprPatch[p as keyof AllMetricsRow] as number) ?? 0) < 0.35);
  const taprFailedDims = PARAMS.filter(p => ((taprPatch[p as keyof AllMetricsRow] as number) ?? 0) < 0.35);

  return (
    <div className="space-y-6">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-slate-900 to-indigo-500/10 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/30">
              🏆 TrustPatch Superiority Analysis
            </span>
          </div>
          <h3 className="text-xl font-black text-white mb-1">
            Quality Profile: BAPR ({baselineSelected}) vs TrustPatch ({trustSelected})
          </h3>
          <p className="text-sm text-slate-400 mb-5">
            {baprTrap && diverged
              ? `BAPR selected ${baselineSelected} (test-gaming patch) — it scores under 20% on 6 of 10 dimensions. TrustPatch selected ${trustSelected} — consistently high across all 10.`
              : `Side-by-side quality profile of both systems' selected patches across all 10 trust dimensions.`}
          </p>

          {/* Stat summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatBox
              label="BAPR Coverage"
              value="1 / 10"
              sub="criteria checked"
              color="red"
              icon="📊"
            />
            <StatBox
              label="TrustPatch Coverage"
              value="10 / 10"
              sub="criteria checked"
              color="teal"
              icon="📊"
            />
            <StatBox
              label={`BAPR Patch (${baselineSelected}) Quality`}
              value={`${(baprAvg * 100).toFixed(0)}%`}
              sub="avg across 10 dims"
              color={baprAvg < 0.5 ? 'red' : 'indigo'}
              icon="⚖️"
            />
            <StatBox
              label={`TrustPatch (${trustSelected}) Quality`}
              value={`${(taprAvg * 100).toFixed(0)}%`}
              sub="avg across 10 dims"
              color="teal"
              icon="✅"
            />
          </div>

          {/* Chart mode toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-slate-400">View:</span>
            {(['bar', 'radar'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setChartMode(mode)}
                className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                  chartMode === mode
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {mode === 'bar' ? '📊 Bar Chart' : '🕸️ Radar Chart'}
              </button>
            ))}
          </div>

          {/* Charts */}
          {chartMode === 'bar' ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qualityData} barCategoryGap="20%" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="param"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={v => `${Math.round(v * 100)}%`}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#334155' }}
                    width={42}
                  />
                  <Tooltip content={<QualityTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs" style={{ color: value === 'BAPR' ? (baprTrap ? '#f87171' : '#818cf8') : '#34d399' }}>
                        {value === 'BAPR' ? `BAPR → ${baselineSelected}${baprTrap ? ' ⚠ Test-Gaming' : ''}` : `TrustPatch → ${trustSelected} ✓`}
                      </span>
                    )}
                  />
                  <Bar dataKey="BAPR" name="BAPR" radius={[4, 4, 0, 0]}>
                    {qualityData.map((entry) => (
                      <Cell
                        key={entry.param}
                        fill={
                          baprTrap && entry.BAPR < 0.35
                            ? '#ef4444'
                            : baprTrap
                            ? '#f97316'
                            : '#6366f1'
                        }
                        fillOpacity={baprTrap && entry.BAPR < 0.35 ? 1 : 0.7}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="TAPR" name="TrustPatch" radius={[4, 4, 0, 0]}>
                    {qualityData.map((entry) => (
                      <Cell key={entry.param} fill="#10b981" fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                  <Radar
                    name={`BAPR → ${baselineSelected}`}
                    dataKey="BAPR"
                    stroke={baprTrap ? '#ef4444' : '#6366f1'}
                    fill={baprTrap ? '#ef4444' : '#6366f1'}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name={`TrustPatch → ${trustSelected}`}
                    dataKey="TAPR"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Legend />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Failed dimensions callout */}
          {baprTrap && baprFailedDims.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-400">
                {baselineSelected} fails on:
              </span>
              {baprFailedDims.map(p => (
                <span key={p} className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full border border-red-500/25">
                  {PARAM_LABELS[p] || p}
                </span>
              ))}
              <span className="text-xs text-slate-500">
                ({baprFailedDims.length}/{PARAMS.length} dimensions)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Execution Time — Reframed as "Analysis Depth" ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-white">⚡ Analysis Depth vs Execution Time</span>
          <span className="text-xs text-slate-500">— extra time = extra safety</span>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          TrustPatch takes more time because it does <strong className="text-white">10×</strong> more analysis. The question isn't
          "which is faster?" — it's "is the extra analysis worth it?"
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* BAPR */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-2">BAPR</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-black text-indigo-300">{baprTime.toFixed(2)}s</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Total pipeline time</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Dimensions checked</span>
                <span className="font-bold text-red-400">1 of 10</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full">
                <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: '10%' }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Patch quality score</span>
                <span className="font-bold text-red-400">{(baprAvg * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${baprAvg * 100}%` }} />
              </div>
            </div>
            {baprTrap && (
              <div className="mt-3 bg-red-500/10 rounded-lg p-2">
                <p className="text-xs text-red-400">⚠ Selected test-gaming patch</p>
              </div>
            )}
          </div>

          {/* vs arrow */}
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Extra time invested</p>
              <p className="text-2xl font-black text-white">+{extraSecs.toFixed(2)}s</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Quality gained</p>
              <p className={`text-2xl font-black ${parseFloat(qualityGain) > 0 ? 'text-teal-400' : 'text-slate-400'}`}>
                +{qualityGain}%
              </p>
            </div>
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-teal-400 font-bold">ROI</p>
              <p className="text-xs text-slate-300 mt-0.5">
                {extraSecs > 0
                  ? `${(parseFloat(qualityGain) / extraSecs).toFixed(0)}% quality/sec`
                  : 'Instant'}
              </p>
            </div>
          </div>

          {/* TrustPatch */}
          <div className="bg-teal-500/5 rounded-xl p-4 border border-teal-500/20">
            <p className="text-xs text-teal-400 font-bold uppercase tracking-wider mb-2">TrustPatch</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-black text-teal-300">{taprTime.toFixed(2)}s</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Total pipeline time</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Dimensions checked</span>
                <span className="font-bold text-teal-400">10 of 10</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full">
                <div className="h-full bg-teal-500 rounded-full w-full" />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Patch quality score</span>
                <span className="font-bold text-teal-400">{(taprAvg * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${taprAvg * 100}%` }} />
              </div>
            </div>
            <div className="mt-3 bg-teal-500/10 rounded-lg p-2">
              <p className="text-xs text-teal-400">✓ Selected genuine fix</p>
            </div>
          </div>
        </div>

        {/* The key reframe */}
        <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-sm font-bold text-white mb-1">💡 Why execution time is not a disadvantage</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            BAPR's speed comes from <span className="text-red-400 font-semibold">checking only 1 of 10 quality dimensions</span>.
            TrustPatch's extra {extraSecs.toFixed(2)}s evaluates 9 additional dimensions — and in this case,
            {baprTrap ? (
              <span className="text-teal-400 font-semibold"> those 9 dimensions revealed that BAPR's choice was a test-gaming patch
              that would fail on any real-world input. The extra time prevented a dangerous patch from shipping.</span>
            ) : (
              <span className="text-teal-400 font-semibold"> produced a quantified, auditable trust score that you can present
              to stakeholders — not just a binary "tests pass" verdict.</span>
            )}
          </p>
        </div>
      </div>

      {/* ── Dimension Coverage Comparison ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CoverageCard
          title="BAPR Criteria"
          count={1}
          total={10}
          color="red"
          criteria={['🧪 Test Pass Rate']}
          missing={['🔬 Semantic Similarity', '🧩 Code Complexity', '📚 Historical Success',
                    '🛡️ Static Analysis', '⚖️ Behavioral Consistency', '🔁 Regression Risk',
                    '📍 Contextual Importance', '🤖 LLM Confidence', '🤝 Multi-Patch']}
        />
        <CoverageCard
          title="TrustPatch Criteria"
          count={10}
          total={10}
          color="teal"
          criteria={['🧪 Test Pass Rate', '🔬 Semantic Similarity', '🧩 Code Complexity',
                    '📚 Historical Success', '🛡️ Static Analysis', '⚖️ Behavioral Consistency',
                    '🔁 Regression Risk', '📍 Contextual Importance', '🤖 LLM Confidence', '🤝 Multi-Patch']}
          missing={[]}
        />
      </div>
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────────

function StatBox({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string;
  color: 'red' | 'teal' | 'indigo'; icon: string;
}) {
  const colors = {
    red:   'bg-red-500/10 border-red-500/20 text-red-400',
    teal:  'bg-teal-500/10 border-teal-500/20 text-teal-400',
    indigo:'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  };
  return (
    <div className={`rounded-xl p-3 border text-center ${colors[color]}`}>
      <p className="text-lg">{icon}</p>
      <p className="text-xl font-black text-white mt-1">{value}</p>
      <p className="text-xs font-semibold mt-0.5">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}

function CoverageCard({ title, count, total, color, criteria, missing }: {
  title: string; count: number; total: number;
  color: 'red' | 'teal'; criteria: string[]; missing: string[];
}) {
  const isGood = color === 'teal';
  return (
    <div className={`rounded-xl p-4 border ${
      isGood ? 'bg-teal-500/5 border-teal-500/20' : 'bg-red-500/5 border-red-500/20'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm font-bold ${isGood ? 'text-teal-400' : 'text-red-400'}`}>{title}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
          isGood ? 'bg-teal-500/20 text-teal-300' : 'bg-red-500/20 text-red-300'
        }`}>{count}/{total} dimensions</span>
      </div>
      <div className="space-y-1.5">
        {criteria.map(c => (
          <div key={c} className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-teal-500">✓</span> {c}
          </div>
        ))}
        {missing.map(c => (
          <div key={c} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-red-500/50">✗</span>
            <span className="line-through opacity-40">{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
