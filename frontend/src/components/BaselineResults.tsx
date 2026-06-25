/**
 * components/BaselineResults.tsx
 * --------------------------------
 * Displays Baseline APR (BAPR) pipeline results.
 * Shows selected patch, test pass rate, and execution time.
 * Styled in indigo to visually distinguish from TrustPatch (teal).
 */

import React, { useState } from 'react';
import { BaselineResult } from '../types';
import { Code2, Clock, TestTube, ChevronDown, ChevronUp } from 'lucide-react';

interface BaselineResultsProps {
  result: BaselineResult;
}

export default function BaselineResults({ result }: BaselineResultsProps) {
  const [showCode, setShowCode] = useState(false);
  const passPercent = Math.round((result.pass_rate ?? 0) * 100);
  const isTrap = (result as any).is_test_gaming_patch;

  return (
    <div className={`p-6 space-y-5 animate-slide-up rounded-2xl border ${
      isTrap
        ? 'bg-red-500/5 border-red-500/30'
        : 'baseline-card'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
            isTrap ? 'bg-red-500/20 border border-red-500/30' : 'bg-indigo-500/20 border border-indigo-500/30'
          }`}>
            {isTrap ? '⚠️' : '🔬'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Baseline APR Result</h3>
            <p className="text-xs text-slate-400">Traditional test-pass-rate selection</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isTrap && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30 animate-pulse font-bold">
              ⚠ TRAPPED
            </span>
          )}
          <span className={`score-badge text-sm px-3 py-1 ${
            isTrap
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          }`}>
            BAPR
          </span>
        </div>
      </div>

      {/* Test-gaming warning */}
      {isTrap && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-sm text-red-400 font-medium">🎭 BAPR selected a test-gaming patch</p>
          <p className="text-xs text-red-400/70 mt-1">
            {result.selected_patch} passes {passPercent}% of tests by memorising test inputs — not by fixing the actual bug.
            BAPR cannot detect this anti-pattern.
          </p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Selected Patch */}
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Selected Patch</p>
          <p className="text-3xl font-black gradient-text-baseline">{result.selected_patch}</p>
          <p className="text-xs text-slate-500 mt-1">Highest pass rate</p>
        </div>

        {/* Test Results */}
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Tests Passed</p>
          <p className="text-3xl font-black text-white">
            {result.passed_tests}
            <span className="text-lg text-slate-500">/{result.total_tests}</span>
          </p>
          <div className="mt-2">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000"
                style={{ width: `${passPercent}%` }}
              />
            </div>
            <p className="text-xs text-indigo-400 mt-1 font-mono">{passPercent}%</p>
          </div>
        </div>

        {/* Execution Time */}
        <div className="glass-card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Execution Time</p>
          <p className="text-3xl font-black text-white font-mono">
            {result.execution_time.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">seconds</p>
        </div>
      </div>

      {/* Selection Criterion */}
      <div className="bg-slate-800/40 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Selection Criterion</p>
        <div className="flex items-center gap-2">
          <span className="text-slate-300 text-sm">Selected</span>
          <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono text-sm border border-indigo-500/30">
            {result.selected_patch}
          </span>
          <span className="text-slate-300 text-sm">because it had the highest test pass rate</span>
          <span className="bg-slate-700 text-white px-2 py-0.5 rounded font-mono text-sm">
            {passPercent}%
          </span>
        </div>
        <p className="text-xs text-red-400/70 mt-2 flex items-center gap-1">
          ⚠️ No code quality, security, or complexity analysis performed.
        </p>
      </div>

      {/* Limitations */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Limitations</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Ignores code complexity',
            'No security analysis',
            'No behavioral verification',
            'No historical context',
            'No regression analysis',
            'No LLM confidence check',
          ].map(l => (
            <div key={l} className="flex items-center gap-2 text-xs text-slate-500">
              <span className="text-red-500">✗</span>
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
