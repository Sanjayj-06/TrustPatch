/**
 * components/PipelineVisualizer.tsx — Light theme
 * Animated dual pipeline flow diagram (BAPR vs TAPR)
 */

import React from "react";
const Lightbulb = () => null;

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface PipelineVisualizerProps {
  currentStep: number;
  isRunning: boolean;
}

const BAPR_STEPS = [
  { label: "Buggy Code", icon: "BUG", active: "text-red-600" },
  { label: "Generate Patches", icon: "GEN", active: "text-slate-700" },
  { label: "Run Tests", icon: "TEST", active: "text-slate-700" },
  { label: "Pick Max Rate", icon: "PICK", active: "text-indigo-700" },
  { label: "Result", icon: "OUT", active: "text-indigo-700" },
];

const TAPR_STEPS = [
  { label: "Buggy Code", icon: "BUG", active: "text-red-600" },
  { label: "Generate P1–P5", icon: "GEN", active: "text-slate-700" },
  { label: "Extract Features", icon: "FTR", active: "text-amber-700" },
  { label: "Compute Params", icon: "10P", active: "text-amber-700" },
  { label: "Normalize", icon: "NRM", active: "text-amber-700" },
  { label: "Weighted Trust", icon: "WT", active: "text-blue-700" },
  { label: "Rank Patches", icon: "RNK", active: "text-blue-700" },
  { label: "Select Best", icon: "SEL", active: "text-blue-700" },
  { label: "Explain", icon: "XAI", active: "text-blue-700" },
  { label: "Result", icon: "OUT", active: "text-blue-700" },
];

function PipelineStep({
  step,
  index,
  activeStep,
  isRunning,
  isTapr,
}: {
  step: { label: string; icon: string; active: string };
  index: number;
  activeStep: number;
  isRunning: boolean;
  isTapr: boolean;
}) {
  const isDone = index < activeStep;
  const isActive = index === activeStep && isRunning;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`
          w-11 h-11 rounded-xl flex items-center justify-center text-[10px] font-black border-2 transition-all duration-400
          ${
            isDone
              ? isTapr
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : "bg-indigo-500 border-indigo-500 text-white shadow-sm"
              : isActive
                ? isTapr
                  ? "bg-blue-50 border-blue-500 text-blue-700 shadow-md ring-2 ring-blue-200 scale-110"
                  : "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-md ring-2 ring-indigo-200 scale-110"
                : "bg-white border-slate-200 text-slate-300"
          }
        `}
      >
        {step.icon}
      </div>
      <p
        className={`text-[10px] font-medium text-center leading-tight max-w-[72px] ${
          isDone || isActive ? "text-slate-700" : "text-slate-300"
        }`}
      >
        {step.label}
      </p>
    </div>
  );
}

function Arrow({ active, isTapr }: { active: boolean; isTapr: boolean }) {
  return (
    <div
      className={`flex-shrink-0 transition-all duration-400 ${active ? "opacity-100" : "opacity-15"}`}
    >
      <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
        <path
          d="M0 5h14M10 1l5 4-5 4"
          stroke={isTapr ? "#2563eb" : "#6366f1"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function PipelineVisualizer({
  currentStep,
  isRunning,
}: PipelineVisualizerProps) {
  const baprStep = Math.min(
    Math.floor((currentStep * BAPR_STEPS.length) / TAPR_STEPS.length),
    BAPR_STEPS.length,
  );
  const containerRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".gsap-pipeline-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          Pipeline Comparison
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Both pipelines executing side by side
        </p>
      </div>

      {/* BAPR Pipeline */}
      <div className="card p-5 border-indigo-200 gsap-pipeline-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
            BAPR — Baseline APR Pipeline
          </p>
          <span className="ml-auto text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
            Test-Only
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {BAPR_STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <PipelineStep
                step={step}
                index={i}
                activeStep={baprStep}
                isRunning={isRunning}
                isTapr={false}
              />
              {i < BAPR_STEPS.length - 1 && (
                <Arrow active={i < baprStep} isTapr={false} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span>Criterion:</span>
          <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
            max(test_pass_rate)
          </code>
          <span className="text-slate-300">— 1 dimension</span>
        </div>
      </div>

      {/* TAPR Pipeline */}
      <div className="card p-5 border-2 border-blue-200 gsap-pipeline-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            TrustPatch — Trust-Aware APR Pipeline
          </p>
          <span className="ml-auto text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
            10-Dimensional
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {TAPR_STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <PipelineStep
                step={step}
                index={i}
                activeStep={currentStep}
                isRunning={isRunning}
                isTapr={true}
              />
              {i < TAPR_STEPS.length - 1 && (
                <Arrow active={i < currentStep} isTapr={true} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span>Criterion:</span>
          <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono border border-blue-100">
            Trust(P) = Σ(wⱼ × fⱼ)
          </code>
          <span className="text-slate-300">— 10 dimensions</span>
        </div>
      </div>

      {/* Key difference callout */}
      <div className="card p-4 flex items-start gap-3 bg-blue-50 border-blue-200">
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-0.5">
            Why TrustPatch is Different
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            BAPR selects whichever patch passes the most tests — ignoring code
            complexity, security risks, and behavioral changes. TrustPatch
            evaluates
            <strong className="text-blue-700"> 10 trust dimensions</strong>,
            weights them by importance, and selects the patch with the highest
            overall trustworthiness.
          </p>
        </div>
      </div>
    </div>
  );
}
