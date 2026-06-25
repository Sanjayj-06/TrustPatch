/**
 * components/ComparisonDashboard.tsx
 * ------------------------------------
 * Comparison dashboard now led by the TrustAdvantageChart hero section.
 *
 * Structure:
 *   1. TrustAdvantageChart (HERO) — Quality profile comparison + time reframe
 *   2. Overview tab — 5 supporting charts
 *   3. Detailed tab — Radar + all-params grouped bar
 */

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { ChartData, AllMetricsRow } from '../types';
import TrustAdvantageChart from './TrustAdvantageChart';

interface ComparisonDashboardProps {
  chartData: ChartData;
  baselineSelected?: string;
  trustSelected?: string;
  diverged?: boolean;
  baprTrap?: boolean;
}

const TEAL   = '#14b8a6';
const INDIGO = '#6366f1';
const RED    = '#ef4444';
const AMBER  = '#f59e0b';

const PATCH_COLORS: Record<string, string> = {
  P1: '#6366f1', P2: '#f59e0b',
  P3: '#ef4444', P4: '#ec4899', P5: '#8b5cf6',
};

const PIE_COLORS = [
  '#14b8a6', '#6366f1', '#f59e0b', '#ec4899',
  '#8b5cf6', '#10b981', '#3b82f6', '#f97316', '#a78bfa', '#6ee7b7',
];

function ChartCard({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-white">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
        </p>
      ))}
    </div>
  );
}

export default function ComparisonDashboard({
  chartData,
  baselineSelected,
  trustSelected,
  diverged = false,
  baprTrap = false,
}: ComparisonDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'detailed', label: '🔬 Detailed' },
  ] as const;

  // Derive baseline/trust selection from chart data if not provided
  const baprId  = baselineSelected  || chartData.all_metrics_comparison.find(r => (r as any).baselineSelected)?.patchId || '';
  const taprId  = trustSelected     || chartData.all_metrics_comparison.find(r => r.selected)?.patchId || '';
  const allRows = chartData.all_metrics_comparison as AllMetricsRow[];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION — TrustPatch Superiority Chart
          ══════════════════════════════════════════════════════════ */}
      <TrustAdvantageChart
        allMetrics={allRows}
        executionTime={chartData.execution_time_comparison}
        baselineSelected={baprId}
        trustSelected={taprId}
        diverged={diverged}
        baprTrap={baprTrap}
      />

      {/* ══════════════════════════════════════════════════════════
          SUPPORTING CHARTS — Tab-based
          ══════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs text-slate-500 uppercase tracking-wider">Supporting Analysis Charts</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="flex gap-2 bg-slate-800/50 rounded-xl p-1 w-fit mb-5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {/* Chart 1: Test Success — contextualized */}
            <ChartCard
              title="1. Test Pass Rate Comparison"
              subtitle={baprTrap && baprId !== taprId
                ? `⚠ BAPR's higher rate is deceptive — ${baprId} memorises test inputs`
                : 'Pass rate of each system\u2019s selected patch'}
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.test_success_comparison} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="approach" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="passRate" name="Pass Rate (%)" radius={[6, 6, 0, 0]}>
                    {chartData.test_success_comparison.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {baprTrap && baprId !== taprId && (
                <p className="text-xs text-red-400/80 italic">
                  Higher isn't always better — BAPR's {baprId} cheats by memorising test values
                </p>
              )}
            </ChartCard>

            {/* Chart 2: Trust Score Distribution */}
            <ChartCard
              title="2. Trust Score Distribution"
              subtitle="Weighted 10-dimensional score across all 5 patches"
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.trust_score_distribution} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="patchId" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 1]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0.7} stroke="#10b981" strokeDasharray="4 4"
                    label={{ value: 'Low Risk ≥0.7', fill: '#10b981', fontSize: 9 }} />
                  <Bar dataKey="trustScore" name="Trust Score" radius={[6, 6, 0, 0]}>
                    {chartData.trust_score_distribution.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={(entry as any).isTestGaming ? RED : entry.color}
                        fillOpacity={(entry as any).isTestGaming ? 0.9 : 0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart 3: Behavioral Consistency — the killer metric */}
            <ChartCard
              title="3. Behavioral Consistency"
              subtitle="Works correctly on unseen inputs (not just test cases)"
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={(chartData as any).behavioral_comparison || chartData.complexity_comparison}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="patchId" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 1]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Behavioral Score" radius={[6, 6, 0, 0]}>
                    {(((chartData as any).behavioral_comparison || chartData.complexity_comparison)).map((entry: any, i: number) => (
                      <Cell
                        key={i}
                        fill={entry.isTestGaming ? RED : entry.selected ? TEAL : '#94a3b8'}
                        fillOpacity={entry.isTestGaming ? 1 : 0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-500 italic">
                Test-gaming patch (P3) ≈ 12% — correct only for the exact 12 test inputs
              </p>
            </ChartCard>

            {/* Chart 4: Safety */}
            <ChartCard
              title="4. Static Analysis Safety"
              subtitle="pylint quality score — fewer warnings = higher score"
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.safety_comparison} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="patchId" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 1]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Safety Score" radius={[6, 6, 0, 0]}>
                    {chartData.safety_comparison.map((entry, i) => (
                      <Cell key={i} fill={(entry as any).isTestGaming ? RED : entry.selected ? TEAL : INDIGO} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart 5: Complexity */}
            <ChartCard
              title="5. Code Complexity"
              subtitle="Inverted cyclomatic complexity — higher score = simpler code"
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.complexity_comparison} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="patchId" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 1]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Complexity Score" radius={[6, 6, 0, 0]}>
                    {chartData.complexity_comparison.map((entry, i) => (
                      <Cell key={i} fill={(entry as any).isTestGaming ? RED : entry.selected ? TEAL : AMBER} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-500 italic">
                P3 scores lowest — isinstance chains, lookup dicts, nested ternaries
              </p>
            </ChartCard>

            {/* Chart 6: Weight Distribution */}
            <ChartCard
              title="6. Trust Parameter Weights"
              subtitle="Expert-defined weight distribution (Σ = 1.0)"
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData.weight_distribution}
                    cx="50%" cy="55%"
                    innerRadius={50} outerRadius={82}
                    dataKey="weight" nameKey="shortName"
                    paddingAngle={2}
                    label={({ shortName, weight }) => `${shortName} ${weight}%`}
                    labelLine={false}
                  >
                    {chartData.weight_distribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _name: string, props: any) =>
                      [`${value}%`, props.payload.parameter]
                    }
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="space-y-5">
            {/* Radar Chart — all patches */}
            <ChartCard
              title="Multi-Dimensional Trust Radar"
              subtitle="All 10 trust parameters across all 5 patches — P3 (red) shows the test-gaming failure"
            >
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={chartData.radar_data}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="parameter" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 1]} tick={{ fill: '#475569', fontSize: 9 }} />
                  {['P1', 'P2', 'P3', 'P4', 'P5'].map(pid => (
                    <Radar
                      key={pid} name={pid} dataKey={pid}
                      stroke={PATCH_COLORS[pid]} fill={PATCH_COLORS[pid]}
                      fillOpacity={pid === 'P3' ? 0.15 : 0.06}
                      strokeWidth={pid === 'P3' ? 2.5 : 1.5}
                    />
                  ))}
                  <Legend formatter={(val) => (
                    <span style={{ color: PATCH_COLORS[val], fontSize: 12 }}>
                      {val}{val === 'P3' ? ' ⚠ Test-Gaming' : ''}
                    </span>
                  )} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* All-metrics grouped bar */}
            <ChartCard
              title="All Parameters per Patch"
              subtitle="Normalized [0,1] values — P3's red bars show why TrustPatch rejected it"
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData.radar_data} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="parameter" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 1]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(val) => (
                    <span style={{ color: PATCH_COLORS[val] || '#94a3b8', fontSize: 11 }}>
                      {val}{val === 'P3' ? ' (BAPR Trap)' : ''}
                    </span>
                  )} />
                  {['P1', 'P2', 'P3', 'P4', 'P5'].map(pid => (
                    <Bar key={pid} dataKey={pid} fill={PATCH_COLORS[pid]} radius={[3, 3, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
}
