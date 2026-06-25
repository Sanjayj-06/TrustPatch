/**
 * components/StepProgress.tsx
 * ----------------------------
 * Animated step-by-step progress tracker shown during pipeline execution.
 * Each step shows real-time status with animated icons and timestamps.
 * This is the "live narration" of what TrustPatch is doing.
 */

import React from 'react';
import { CheckCircle, Circle, Loader, XCircle } from 'lucide-react';
import { PipelineStep, StepStatus } from '../types';

interface StepProgressProps {
  steps: PipelineStep[];
  title?: string;
  color?: 'teal' | 'indigo';
}

function StatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'done':
      return <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />;
    case 'running':
      return <Loader className="w-5 h-5 text-teal-400 flex-shrink-0 animate-spin" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />;
    default:
      return <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />;
  }
}

export default function StepProgress({
  steps,
  title = 'Pipeline Progress',
  color = 'teal',
}: StepProgressProps) {
  const doneCount = steps.filter(s => s.status === 'done').length;
  const total = steps.length;
  const progressPct = total > 0 ? (doneCount / total) * 100 : 0;

  const accentColor = color === 'teal' ? 'teal' : 'indigo';

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <span className={`text-xs font-mono text-${accentColor}-400`}>
          {doneCount}/{total} steps
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-${accentColor}-600 to-${accentColor}-400 rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`step-indicator-${step.status}`}
          >
            <StatusIcon status={step.status} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-tight ${
                step.status === 'done' ? 'text-slate-300' :
                step.status === 'running' ? `text-${accentColor}-300` :
                step.status === 'error' ? 'text-red-400' :
                'text-slate-600'
              }`}>
                {step.label}
              </p>
              {step.status !== 'pending' && (
                <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
              )}
            </div>
            {step.status === 'running' && (
              <div className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full bg-${accentColor}-400`}
                    style={{ animationDelay: `${i * 0.15}s`, animation: 'bounce 0.8s infinite' }}
                  />
                ))}
              </div>
            )}
            {step.duration && step.status === 'done' && (
              <span className="text-xs text-slate-600 font-mono flex-shrink-0">
                {step.duration.toFixed(2)}s
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Pre-defined step configurations for both pipelines
export const TRUSTPATCH_STEPS: PipelineStep[] = [
  { id: 'upload', label: 'Files Uploaded', description: 'Buggy code and tests received', status: 'pending' },
  { id: 'generate', label: 'Generating 5 Patches', description: 'P1–P5 from rule-based transformations', status: 'pending' },
  { id: 'test', label: 'Running Unit Tests', description: 'Pytest executed on each patch', status: 'pending' },
  { id: 'features', label: 'Extracting Features', description: 'Computing raw parameter values', status: 'pending' },
  { id: 'normalize', label: 'Normalizing Parameters', description: 'Min-max scaling to [0, 1]', status: 'pending' },
  { id: 'trust', label: 'Computing Trust Scores', description: 'Weighted sum: Trust(P) = Σ(wⱼ × fⱼ)', status: 'pending' },
  { id: 'rank', label: 'Ranking Patches', description: 'Sorting P1–P5 by trust score', status: 'pending' },
  { id: 'explain', label: 'Generating Explanation', description: 'Identifying top contributing factors', status: 'pending' },
  { id: 'done', label: 'Evaluation Complete', description: 'Results ready for display', status: 'pending' },
];
