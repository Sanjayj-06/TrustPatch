/**
 * components/BAPRFailureAlert.tsx
 * --------------------------------
 * The centrepiece showcase component shown when TrustPatch catches the
 * test-gaming trap that BAPR fell for.
 *
 * This is designed to WOW the audience during a presentation:
 *   "BAPR selected P3 because it passed 100% of tests.
 *    But P3 is a test-gaming patch that memorises test inputs.
 *    TrustPatch caught it — here's the evidence."
 *
 * Shown ONLY when: diverged === true && bapr_trap_triggered === true
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { ExplanationData } from '../types';

interface BAPRFailureAlertProps {
  explanation: ExplanationData;
  baprPatchId: string;
  taprPatchId: string;
  baprPassRate: number;
  taprTrustScore: number;
  rejectedTrustScore?: number;
}

// Animated counter for dramatic effect
function AnimatedScore({ target, color }: { target: number; color: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setValue(Math.round(current * 1000) / 1000);
      if (current >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="font-black tabular-nums" style={{ color }}>
      {value.toFixed(3)}
    </span>
  );
}

export default function BAPRFailureAlert({
  explanation,
  baprPatchId,
  taprPatchId,
  baprPassRate,
  taprTrustScore,
  rejectedTrustScore,
}: BAPRFailureAlertProps) {
  const [expanded, setExpanded] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const baprPct = Math.round(baprPassRate * 100);

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
      {/* ── Main Alert Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-red-500/60 bg-gradient-to-br from-red-500/10 via-slate-900 to-slate-900 shadow-[0_0_40px_rgba(239,68,68,0.2)]">

        {/* Animated background pulse */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent animate-pulse-slow pointer-events-none" />

        {/* Header */}
        <div className="relative p-5 border-b border-red-500/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(239,68,68,0.3)]">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30">
                    ⚠ BAPR FAILURE DETECTED
                  </span>
                </div>
                <h3 className="text-lg font-black text-white leading-tight">
                  BAPR Fell for the Test-Gaming Trap
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  TrustPatch correctly identified and rejected the unsafe patch
                </p>
              </div>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="relative p-5 space-y-5">

            {/* Score comparison */}
            <div className="grid grid-cols-2 gap-4">
              {/* BAPR's choice — RED */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center space-y-2">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  ❌ BAPR Selected
                </p>
                <p className="text-4xl font-black text-red-400">{baprPatchId}</p>
                <div className="space-y-1">
                  <p className="text-sm text-slate-300">
                    <span className="text-red-400 font-bold">{baprPct}%</span> test pass rate
                  </p>
                  <p className="text-xs text-red-400/70">
                    Trust score:{' '}
                    {rejectedTrustScore !== undefined
                      ? <AnimatedScore target={rejectedTrustScore} color="#f87171" />
                      : '—'}
                  </p>
                </div>
                <div className="bg-red-900/30 rounded-lg p-2 mt-2">
                  <p className="text-xs text-red-400 font-medium">
                    🎭 Test-Gaming Patch
                  </p>
                  <p className="text-xs text-red-400/70 mt-0.5">
                    Memorises test inputs — breaks on real data
                  </p>
                </div>
              </div>

              {/* TrustPatch's choice — GREEN */}
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 text-center space-y-2">
                <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  ✓ TrustPatch Selected
                </p>
                <p className="text-4xl font-black text-teal-400">{taprPatchId}</p>
                <div className="space-y-1">
                  <p className="text-sm text-slate-300">
                    Trust score:{' '}
                    <AnimatedScore target={taprTrustScore} color="#34d399" />
                  </p>
                  <p className="text-xs text-teal-400/70">
                    vs. {rejectedTrustScore !== undefined ? rejectedTrustScore.toFixed(3) : '—'} for {baprPatchId}
                  </p>
                </div>
                <div className="bg-teal-900/30 rounded-lg p-2 mt-2">
                  <p className="text-xs text-teal-400 font-medium">
                    ✓ Genuine Algorithm Fix
                  </p>
                  <p className="text-xs text-teal-400/70 mt-0.5">
                    Works correctly for ALL inputs
                  </p>
                </div>
              </div>
            </div>

            {/* What went wrong — evidence cards */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                📋 Why {baprPatchId} is Dangerous (What BAPR Missed)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    param: 'B',
                    label: 'Behavioral Consistency',
                    icon: '⚖️',
                    score: explanation.parameter_impact['B']
                      ? (explanation.parameter_impact['B'] / 0.10) : 0.12,
                    desc: 'Fails on ANY input not in the hardcoded table',
                    critical: true,
                  },
                  {
                    param: 'C',
                    label: 'Code Complexity',
                    icon: '🧩',
                    score: explanation.parameter_impact['C']
                      ? (explanation.parameter_impact['C'] / 0.10) : 0.12,
                    desc: 'Dict lookups, isinstance chains, nested ternaries',
                    critical: true,
                  },
                  {
                    param: 'A',
                    label: 'Static Analysis',
                    icon: '🛡️',
                    score: explanation.parameter_impact['A']
                      ? (explanation.parameter_impact['A'] / 0.10) : 0.15,
                    desc: 'pylint flags magic numbers, dead code, overcomplexity',
                    critical: true,
                  },
                  {
                    param: 'L',
                    label: 'LLM Confidence',
                    icon: '🤖',
                    score: explanation.parameter_impact['L']
                      ? (explanation.parameter_impact['L'] / 0.10) : 0.18,
                    desc: 'Any LLM would flag hardcoded overrides as anti-pattern',
                    critical: false,
                  },
                ].map(({ param, label, icon, score, desc, critical }) => (
                  <div
                    key={param}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      critical
                        ? 'bg-red-500/5 border-red-500/20'
                        : 'bg-amber-500/5 border-amber-500/20'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${critical ? 'text-red-400' : 'text-amber-400'}`}>
                          {label}
                        </span>
                        <span className={`text-xs font-mono font-bold ${critical ? 'text-red-400' : 'text-amber-400'}`}>
                          {Math.round(score * 100)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            critical ? 'bg-red-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The key message */}
            <div className="bg-gradient-to-r from-teal-500/10 via-slate-800/50 to-indigo-500/10 rounded-xl p-4 border border-teal-500/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white mb-1">
                    Why This Matters
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    In production, {baprPatchId}'s lookup table would silently return wrong answers
                    for any input not in the developer's test suite — including edge cases, new
                    data, or adversarial inputs. BAPR would ship this as "100% passing."
                    TrustPatch's 10-dimensional analysis caught it through
                    <span className="text-teal-400 font-semibold"> behavioral consistency</span>,
                    <span className="text-teal-400 font-semibold"> static analysis</span>, and
                    <span className="text-teal-400 font-semibold"> LLM confidence</span> checks.
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle full trap reason */}
            {explanation.bapr_trap_reason && (
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Full technical explanation
                </button>
                {showDetails && (
                  <div className="mt-2 bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400 leading-relaxed animate-fade-in">
                    {explanation.bapr_trap_reason}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
