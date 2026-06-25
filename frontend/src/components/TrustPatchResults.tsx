/**
 * components/TrustPatchResults.tsx
 * ---------------------------------
 * Displays the TrustPatch (TAPR) pipeline result with full trust score,
 * risk assessment, recommendation, and top contributing factors.
 * Styled in teal to contrast with BAPR's indigo.
 */

import React, { useState } from 'react';
import { TrustPatchResult, ExplanationData, PARAM_LABELS } from '../types';
import { Code2, ChevronDown, ChevronUp, Shield, Brain } from 'lucide-react';

interface TrustPatchResultsProps {
  result: TrustPatchResult;
  explanation: ExplanationData;
}

function TrustGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const angle = score * 180; // 0 → 0°, 1 → 180°

  const color = score >= 0.70 ? '#10b981' : score >= 0.45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Gauge background arc */}
        <svg viewBox="0 0 120 60" className="w-full h-full">
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Gauge fill arc */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${score * 157} 157`}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
          {/* Needle */}
          <line
            x1="60"
            y1="60"
            x2={60 + 38 * Math.cos((Math.PI * (1 - score)))}
            y2={60 - 38 * Math.sin((Math.PI * (1 - score)))}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="60" cy="60" r="4" fill="white" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-4xl font-black" style={{ color }}>{pct}%</p>
        <p className="text-xs text-slate-500">Trust Score</p>
      </div>
    </div>
  );
}

export default function TrustPatchResults({ result, explanation }: TrustPatchResultsProps) {
  const [showCode, setShowCode] = useState(false);

  const riskColors = {
    Low: 'score-badge-low',
    Medium: 'score-badge-medium',
    High: 'score-badge-high',
  };

  const recColors = {
    Accept: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    Review: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    Reject: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };

  return (
    <div className="trust-card p-6 space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-lg">
            🛡️
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">TrustPatch Result</h3>
            <p className="text-xs text-slate-400">10-dimensional trust-aware selection</p>
          </div>
        </div>
        <span className="score-badge bg-teal-500/20 text-teal-300 border border-teal-500/30 text-sm px-3 py-1">
          TAPR
        </span>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trust Gauge */}
        <div className="glass-card p-5 flex flex-col items-center gap-3">
          <TrustGauge score={result.trust_score} />
          <div className="flex gap-2">
            <span className={riskColors[result.risk]}>
              🎯 {result.risk} Risk
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${recColors[result.recommendation]}`}>
              {result.recommendation === 'Accept' ? '✓' : result.recommendation === 'Review' ? '⚠' : '✗'} {result.recommendation}
            </span>
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="space-y-3">
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Selected Patch</p>
            <p className="text-3xl font-black gradient-text-trust">{result.selected_patch}</p>
            <p className="text-xs text-slate-500 mt-1">Highest trust score</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-3 text-center">
              <p className="text-xs text-slate-500">Tests</p>
              <p className="text-lg font-bold text-white">
                {result.passed_tests}/{result.total_tests}
              </p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-xs text-slate-500">Time</p>
              <p className="text-lg font-bold text-white font-mono">
                {result.execution_time.toFixed(2)}s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Contributing Factors */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Top Contributing Trust Factors
        </p>
        <div className="grid grid-cols-3 gap-3">
          {result.top_factors.slice(0, 3).map((param, i) => (
            <div key={param} className="glass-card p-3 text-center border border-teal-500/20">
              <div className="text-lg mb-1">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
              </div>
              <p className="text-xs font-bold text-teal-400">{param}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {PARAM_LABELS[param as keyof typeof PARAM_LABELS] || param}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Formula Display */}
      <div className="bg-slate-800/50 rounded-xl p-4 font-mono">
        <p className="text-xs text-slate-500 mb-2">Trust Formula Applied:</p>
        <p className="text-sm text-teal-400">
          Trust({result.selected_patch}) = Σ(w<sub>j</sub> × f<sub>j</sub>) = <strong className="text-white">{result.trust_score.toFixed(4)}</strong>
        </p>
      </div>

      {/* Advantages over BAPR */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Advantages over BAPR</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Considers code complexity',
            'Security static analysis',
            'Behavioral verification',
            'Historical success data',
            'Regression risk analysis',
            'LLM confidence scoring',
          ].map(l => (
            <div key={l} className="flex items-center gap-2 text-xs text-teal-400">
              <span>✓</span>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Code Toggle */}
      <button
        onClick={() => setShowCode(!showCode)}
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
      >
        <Code2 className="w-4 h-4" />
        {showCode ? 'Hide' : 'View'} selected patch code
        {showCode ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {showCode && (
        <pre className="code-block text-xs max-h-48 overflow-auto animate-fade-in">
          {result.patch_code}
        </pre>
      )}
    </div>
  );
}
