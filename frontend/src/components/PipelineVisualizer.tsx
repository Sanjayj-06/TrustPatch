/**
 * components/PipelineVisualizer.tsx
 * ----------------------------------
 * Animated dual pipeline flow diagram showing BAPR vs TAPR step-by-step.
 * This is the showcase centerpiece — visually explains how both approaches work
 * and why TrustPatch is superior.
 *
 * Shows both pipelines side-by-side with animated step progression.
 */

import React from 'react';
import { StepStatus } from '../types';

interface PipelineVisualizerProps {
  currentStep: number;  // 0-based step index for TAPR pipeline
  isRunning: boolean;
}

const BAPR_STEPS = [
  { label: 'Buggy Code', icon: '🐛', color: 'text-red-400' },
  { label: 'Generate Patches', icon: '⚙️', color: 'text-slate-400' },
  { label: 'Run Tests', icon: '🧪', color: 'text-slate-400' },
  { label: 'Pick Max Pass Rate', icon: '📈', color: 'text-indigo-400' },
  { label: 'Result', icon: '✅', color: 'text-indigo-300' },
];

const TAPR_STEPS = [
  { label: 'Buggy Code', icon: '🐛', color: 'text-red-400' },
  { label: 'Generate P1–P5', icon: '⚙️', color: 'text-slate-400' },
  { label: 'Extract Features', icon: '🔬', color: 'text-amber-400' },
  { label: 'Compute 10 Params', icon: '📊', color: 'text-amber-400' },
  { label: 'Normalize Values', icon: '⚖️', color: 'text-amber-400' },
  { label: 'Weighted Trust', icon: '🎯', color: 'text-teal-400' },
  { label: 'Rank Patches', icon: '🏆', color: 'text-teal-400' },
  { label: 'Select Best', icon: '💎', color: 'text-teal-400' },
  { label: 'Explain', icon: '🧠', color: 'text-teal-300' },
  { label: 'Result', icon: '✅', color: 'text-teal-300' },
];

function PipelineStep({
  step,
  index,
  activeStep,
  isRunning,
  isTapr,
}: {
  step: { label: string; icon: string; color: string };
  index: number;
  activeStep: number;
  isRunning: boolean;
  isTapr: boolean;
}) {
  const isDone = index < activeStep;
  const isActive = index === activeStep && isRunning;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center text-xl border transition-all duration-500
          ${isDone
            ? isTapr
              ? 'bg-teal-500/30 border-teal-500/60 shadow-[0_0_12px_rgba(20,184,166,0.3)]'
              : 'bg-indigo-500/30 border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
            : isActive
            ? isTapr
              ? 'bg-teal-500/20 border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.5)] scale-110 animate-pulse'
              : 'bg-indigo-500/20 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110 animate-pulse'
            : 'bg-slate-800/40 border-slate-700/50 opacity-40'
          }
        `}
      >
        {step.icon}
      </div>
      <p className={`text-xs font-medium text-center leading-tight max-w-[80px] ${
        isDone || isActive ? 'text-slate-300' : 'text-slate-600'
      }`}>
        {step.label}
      </p>
    </div>
  );
}

function Arrow({ active, isTapr }: { active: boolean; isTapr: boolean }) {
  return (
    <div className={`flex-shrink-0 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-20'}`}>
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
        <path
          d="M0 6h16M12 2l6 4-6 4"
          stroke={isTapr ? '#14b8a6' : '#6366f1'}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function PipelineVisualizer({ currentStep, isRunning }: PipelineVisualizerProps) {
  // Map TAPR steps to BAPR equivalent (BAPR is simpler — fewer steps)
  const baprStep = Math.min(Math.floor(currentStep * BAPR_STEPS.length / TAPR_STEPS.length), BAPR_STEPS.length);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-1">Pipeline Comparison</h3>
        <p className="text-slate-400 text-sm">Watch both pipelines execute side by side</p>
      </div>

      {/* BAPR Pipeline */}
      <div className="baseline-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse-slow" />
          <p className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
            BAPR — Baseline APR Pipeline
          </p>
          <span className="ml-auto text-xs text-slate-500 bg-slate-800 rounded-full px-2 py-0.5">
            Traditional • Test-Only
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {BAPR_STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <PipelineStep step={step} index={i} activeStep={baprStep} isRunning={isRunning} isTapr={false} />
              {i < BAPR_STEPS.length - 1 && <Arrow active={i < baprStep} isTapr={false} />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>Selection criterion:</span>
          <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
            max(test_pass_rate)
          </span>
          <span className="text-slate-600">— 1 dimension only</span>
        </div>
      </div>

      {/* TAPR Pipeline */}
      <div className="trust-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse-slow" />
          <p className="text-sm font-bold text-teal-400 uppercase tracking-wider">
            TrustPatch — Trust-Aware APR Pipeline
          </p>
          <span className="ml-auto text-xs text-slate-500 bg-slate-800 rounded-full px-2 py-0.5">
            Advanced • 10-Dimensional
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {TAPR_STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <PipelineStep step={step} index={i} activeStep={currentStep} isRunning={isRunning} isTapr={true} />
              {i < TAPR_STEPS.length - 1 && <Arrow active={i < currentStep} isTapr={true} />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>Selection criterion:</span>
          <span className="bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/30 font-mono">
            Trust(P) = Σ(wⱼ × fⱼ)
          </span>
          <span className="text-slate-600">— 10 dimensions weighted</span>
        </div>
      </div>

      {/* Key Difference Callout */}
      <div className="glass-card p-4 flex items-start gap-3">
        <div className="text-2xl">💡</div>
        <div>
          <p className="text-sm font-semibold text-white mb-1">Why TrustPatch is Different</p>
          <p className="text-xs text-slate-400">
            BAPR makes a blind bet on whichever patch passes the most tests — ignoring code complexity,
            security risks, behavioral changes, and historical patterns. TrustPatch evaluates
            <strong className="text-teal-400"> 10 trust dimensions</strong>, weights them by importance,
            and selects the patch with the highest overall trustworthiness.
          </p>
        </div>
      </div>
    </div>
  );
}
