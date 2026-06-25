/**
 * components/ExplainabilityCard.tsx
 * ----------------------------------
 * Explainability card displaying why TrustPatch selected a particular patch.
 * Shows:
 *  - Summary sentence
 *  - Bullet-point reasoning (top 6 factors)
 *  - Comparison with BAPR decision
 *  - Parameter contribution breakdown
 *  - API response preview (for developers)
 */

import React, { useState } from 'react';
import { ExplanationData, PARAM_LABELS, PARAM_DESCRIPTIONS } from '../types';
import { Brain, ChevronDown, ChevronUp, Code2 } from 'lucide-react';

interface ExplainabilityCardProps {
  explanation: ExplanationData;
  comparisonSummary: string;
  trustScore: number;
  selectedPatch: string;
}

export default function ExplainabilityCard({
  explanation,
  comparisonSummary,
  trustScore,
  selectedPatch,
}: ExplainabilityCardProps) {
  const [showApi, setShowApi] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  // API response preview (as specified in the requirements)
  const apiResponse = {
    trust_score: trustScore,
    risk: explanation.risk_level,
    recommendation: explanation.recommendation,
    explanation: explanation.summary,
    top_factors: explanation.top_factors,
  };

  const riskColors = {
    Low: 'text-emerald-400',
    Medium: 'text-amber-400',
    High: 'text-red-400',
  };

  return (
    <div className="trust-card p-6 space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
          <Brain className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Explainability Engine</h3>
          <p className="text-xs text-slate-400">Why was this patch selected?</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-lg font-bold ${riskColors[explanation.risk_level as keyof typeof riskColors] || 'text-slate-300'}`}>
            {explanation.risk_icon} {explanation.risk_level} Risk
          </span>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4">
        <p className="text-sm text-teal-300 font-medium leading-relaxed">
          {explanation.summary}
        </p>
      </div>

      {/* Why Selected — Bullet Points */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          ✓ Reasons for Selection ({selectedPatch})
        </p>
        <div className="space-y-2">
          {explanation.bullets.map((bullet, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="text-teal-400 font-bold mt-0.5 flex-shrink-0">✓</span>
              <p className="text-sm text-slate-300">{bullet}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parameter Contribution Breakdown */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Parameter Impact (weighted contribution)
        </p>
        <div className="space-y-2">
          {Object.entries(explanation.parameter_impact).slice(0, 5).map(([param, contribution]) => {
            const label = PARAM_LABELS[param as keyof typeof PARAM_LABELS] || param;
            const maxContrib = 0.20; // max possible (T has weight 0.20)
            const barWidth = Math.min((contribution / maxContrib) * 100, 100);

            return (
              <div key={param} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono font-medium">{param}</span>
                  <span className="text-slate-500">{label}</span>
                  <span className="text-teal-400 font-mono">{(contribution * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-1000"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Toggle */}
      <div>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors mb-2"
        >
          🆚 BAPR vs TrustPatch Comparison
          {showComparison ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showComparison && (
          <div className="bg-slate-800/40 rounded-xl p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line animate-fade-in">
            {comparisonSummary}
          </div>
        )}
      </div>

      {/* API Response Preview */}
      <div>
        <button
          onClick={() => setShowApi(!showApi)}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
        >
          <Code2 className="w-4 h-4" />
          API Response Preview (POST /trustpatch/evaluate)
          {showApi ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showApi && (
          <pre className="code-block text-xs mt-2 animate-fade-in">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
