/**
 * App.tsx
 * --------
 * Main TrustPatch application component.
 *
 * This is the showcase dashboard — designed for presentations.
 * It orchestrates the full user workflow:
 *
 * Phase 1: Upload
 *   → User uploads buggy file + test file (or uses sample)
 *   → Calls POST /upload → receives session_id
 *
 * Phase 2: Processing (animated pipeline)
 *   → Calls POST /trustpatch/evaluate
 *   → Animates step-by-step pipeline progress
 *   → Shows BAPR and TAPR pipelines side by side
 *
 * Phase 3: Results
 *   → Section A: Pipeline Visualizer (final state)
 *   → Section B: BAPR vs TAPR comparison cards
 *   → Section C: Patch Ranking Table
 *   → Section D: Comparison Charts Dashboard
 *   → Section E: Explainability Card
 *   → Section F: History sidebar
 *
 * Navigation: Smooth scroll + sticky nav tabs between sections.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import PipelineVisualizer from './components/PipelineVisualizer';
import StepProgress, { TRUSTPATCH_STEPS } from './components/StepProgress';
import BaselineResults from './components/BaselineResults';
import TrustPatchResults from './components/TrustPatchResults';
import PatchRankingTable from './components/PatchRankingTable';
import ComparisonDashboard from './components/ComparisonDashboard';
import ExplainabilityCard from './components/ExplainabilityCard';
import BAPRFailureAlert from './components/BAPRFailureAlert';
import { uploadFiles, evaluateTrustPatch, checkHealth } from './api/trustpatch';
import {
  AppState, PipelineStep, StepStatus, EvaluationResponse, AllMetricsRow
} from './types';
import { Activity, BarChart3, Brain, Shield, Table2, Upload, History, Wifi, WifiOff } from 'lucide-react';

// ============================================================
// Constants
// ============================================================

const NAV_SECTIONS = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'pipeline', label: 'Pipeline', icon: Activity },
  { id: 'results', label: 'Results', icon: Shield },
  { id: 'ranking', label: 'Ranking', icon: Table2 },
  { id: 'charts', label: 'Charts', icon: BarChart3 },
  { id: 'explain', label: 'Explain', icon: Brain },
] as const;

// Step simulation delay (ms) — controls animation speed
const STEP_DELAY = 800;

// ============================================================
// Utilities
// ============================================================

function updateStep(
  steps: PipelineStep[],
  id: string,
  status: StepStatus,
  duration?: number
): PipelineStep[] {
  return steps.map(s => s.id === id ? { ...s, status, duration } : s);
}

// ============================================================
// App Component
// ============================================================

export default function App() {
  const [state, setState] = useState<AppState>({
    phase: 'upload',
    sessionId: null,
    filename: null,
    testFilename: null,
    evaluation: null,
    error: null,
  });

  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(
    TRUSTPATCH_STEPS.map(s => ({ ...s }))
  );
  const [currentPipelineStep, setCurrentPipelineStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [activeSection, setActiveSection] = useState('upload');

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // ============================================================
  // Backend health check on mount
  // ============================================================
  useEffect(() => {
    checkHealth().then(ok => setBackendOnline(ok));
  }, []);

  // ============================================================
  // Scroll spy for nav
  // ============================================================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [state.phase]);

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ============================================================
  // Pipeline step animation
  // ============================================================
  const animateStep = useCallback((stepId: string, stepIndex: number) => {
    return new Promise<void>(resolve => {
      setPipelineSteps(prev => updateStep(prev, stepId, 'running'));
      setCurrentPipelineStep(stepIndex);

      setTimeout(() => {
        setPipelineSteps(prev => updateStep(prev, stepId, 'done', Math.random() * 0.5 + 0.1));
        resolve();
      }, STEP_DELAY);
    });
  }, []);

  // ============================================================
  // Main evaluation handler
  // ============================================================
  const handleUpload = useCallback(async (buggyFile: File, testFile: File) => {
    setIsLoading(true);
    setState(prev => ({ ...prev, error: null, phase: 'processing' }));

    // Reset pipeline steps
    setPipelineSteps(TRUSTPATCH_STEPS.map(s => ({ ...s, status: 'pending' })));
    setCurrentPipelineStep(0);

    try {
      // Step 1: Upload files
      await animateStep('upload', 0);
      const uploadResp = await uploadFiles(buggyFile, testFile);
      const sessionId = uploadResp.session_id;

      setState(prev => ({
        ...prev,
        sessionId,
        filename: uploadResp.filename,
        testFilename: uploadResp.test_filename,
      }));

      // Steps 2–8: Simulate pipeline animation while API runs
      const stepIds = ['generate', 'test', 'features', 'normalize', 'trust', 'rank', 'explain'];
      for (let i = 0; i < stepIds.length; i++) {
        animateStep(stepIds[i], i + 1); // Don't await — let them animate
        if (i < 2) await new Promise(r => setTimeout(r, STEP_DELAY)); // Wait for first 2
      }

      // Call the main evaluation API (runs in parallel with animations)
      const evalResult: EvaluationResponse = await evaluateTrustPatch(sessionId);

      // Mark all steps done
      setPipelineSteps(prev =>
        prev.map(s => ({ ...s, status: 'done' as StepStatus }))
      );
      setCurrentPipelineStep(9);

      setState(prev => ({
        ...prev,
        phase: 'results',
        evaluation: evalResult,
      }));

      // Scroll to results
      setTimeout(() => scrollTo('pipeline'), 300);

    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || err?.message || 'Evaluation failed';
      setState(prev => ({ ...prev, error: errMsg, phase: 'upload' }));
      setPipelineSteps(prev => prev.map(s =>
        s.status === 'running' ? { ...s, status: 'error' as StepStatus } : s
      ));
    } finally {
      setIsLoading(false);
    }
  }, [animateStep]);

  const baselineId = state.evaluation?.baseline.selected_patch;
  const allMetricsRows: AllMetricsRow[] = (
    state.evaluation?.chart_data.all_metrics_comparison || []
  ).map(row => ({
    ...row,
    patchId:          row.patchId,
    trustScore:       row.trustScore,
    rank:             row.rank,
    selected:         row.selected,
    baselineScore:    row.baselineScore,
    baselineSelected: row.patchId === baselineId,
    isTestGaming:     (row as any).isTestGaming,
    strategy:         (row as any).strategy,
    T: row.T, S: row.S, C: row.C, H: row.H, A: row.A,
    B: row.B, R: row.R, X: row.X, L: row.L, M: row.M,
  }));

  // ============================================================
  // Render
  // ============================================================
  const eval_ = state.evaluation;

  return (
    <div className="min-h-screen bg-grid">
      {/* ======================================================
          HEADER
          ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 backdrop-blur-xl bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-teal-500/30">
              TP
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">TrustPatch</h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Trust-Aware Self-Healing Framework</p>
            </div>
          </div>

          {/* Nav tabs (visible in results phase) */}
          {state.phase === 'results' && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
              {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeSection === id
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </nav>
          )}

          {/* Backend status */}
          <div className="flex items-center gap-2 text-xs">
            {backendOnline === true ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" /> Backend Online
              </span>
            ) : backendOnline === false ? (
              <span className="flex items-center gap-1.5 text-red-400">
                <WifiOff className="w-3.5 h-3.5" /> Backend Offline
              </span>
            ) : (
              <span className="text-slate-500">Checking...</span>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================
          HERO BANNER
          ====================================================== */}
      <div className="border-b border-slate-800/50 bg-gradient-to-r from-teal-500/5 via-transparent to-indigo-500/5">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 text-teal-400 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Research Prototype — BAPR vs TAPR Experimental Comparison
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
            <span className="gradient-text-trust">TrustPatch</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-2">
            Trust-Aware and Explainable Self-Healing Framework for Reliable Software Systems
          </p>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Experimentally comparing Baseline APR (test-only) with Trust-Aware APR (10-dimensional)
            across code quality, security, semantic similarity, and behavioral consistency.
          </p>
        </div>
      </div>

      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">

        {/* ---- Section: Upload ---- */}
        <section
          id="upload"
          ref={el => { sectionRefs.current['upload'] = el; }}
        >
          <UploadSection onUpload={handleUpload} isLoading={isLoading} />
        </section>

        {/* ---- Error Display ---- */}
        {state.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            ⚠️ {state.error}
            {!backendOnline && (
              <p className="mt-1 text-xs text-red-500">
                Make sure the Docker backend is running: <code className="bg-red-900/30 px-1 rounded">docker-compose up</code>
              </p>
            )}
          </div>
        )}

        {/* ---- Section: Pipeline Visualizer ---- */}
        {(state.phase === 'processing' || state.phase === 'results') && (
          <section
            id="pipeline"
            ref={el => { sectionRefs.current['pipeline'] = el; }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-400" />
                Step 2: Pipeline Execution
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <PipelineVisualizer
                  currentStep={currentPipelineStep}
                  isRunning={isLoading}
                />
              </div>
              <div>
                <StepProgress
                  steps={pipelineSteps}
                  title="TrustPatch Progress"
                  color="teal"
                />
              </div>
            </div>
          </section>
        )}

        {/* ---- Sections 3–6: Results (only after evaluation) ---- */}
        {state.phase === 'results' && eval_ && (
          <>
            {/* Section: Results Comparison */}
            <section
              id="results"
              ref={el => { sectionRefs.current['results'] = el; }}
              className="space-y-6"
            >
              <SectionHeader
                icon={<Shield className="w-5 h-5 text-teal-400" />}
                title="Step 3: BAPR vs TrustPatch Results"
                subtitle="Side-by-side comparison of both pipeline outputs"
              />
              {/* BAPR Failure Alert — shown first when trap fires */}
              {eval_.bapr_trap_triggered && (
                <BAPRFailureAlert
                  explanation={eval_.explanation}
                  baprPatchId={eval_.baseline.selected_patch}
                  taprPatchId={eval_.trustpatch.selected_patch}
                  baprPassRate={eval_.baseline.pass_rate}
                  taprTrustScore={eval_.trustpatch.trust_score}
                  rejectedTrustScore={eval_.explanation.rejected_trust_score}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BaselineResults result={eval_.baseline as any} />
                <TrustPatchResults result={eval_.trustpatch as any} explanation={eval_.explanation} />
              </div>

              {/* Winner Banner */}
              <WinnerBanner
                baseline={eval_.baseline.selected_patch}
                trustpatch={eval_.trustpatch.selected_patch}
                trustScore={eval_.trustpatch.trust_score}
                agreed={eval_.baseline.selected_patch === eval_.trustpatch.selected_patch}
                baprTrap={eval_.bapr_trap_triggered}
                baprPassRate={eval_.baseline.pass_rate}
              />
            </section>

            {/* Section: Ranking Table */}
            <section
              id="ranking"
              ref={el => { sectionRefs.current['ranking'] = el; }}
              className="space-y-4"
            >
              <SectionHeader
                icon={<Table2 className="w-5 h-5 text-teal-400" />}
                title="Step 4: Patch Ranking Table"
                subtitle="All 5 patches evaluated across 10 trust dimensions"
              />
              <PatchRankingTable
                patches={allMetricsRows}
                baselineSelected={eval_.baseline.selected_patch}
              />
            </section>

            {/* Section: Comparison Charts */}
            <section
              id="charts"
              ref={el => { sectionRefs.current['charts'] = el; }}
              className="space-y-4"
            >
              <SectionHeader
                icon={<BarChart3 className="w-5 h-5 text-teal-400" />}
                title="Step 5: Comparison Dashboard"
                subtitle="Visual evidence of why TrustPatch outperforms BAPR"
              />
              <ComparisonDashboard
                chartData={eval_.chart_data}
                baselineSelected={eval_.baseline.selected_patch}
                trustSelected={eval_.trustpatch.selected_patch}
                diverged={eval_.diverged}
                baprTrap={eval_.bapr_trap_triggered}
              />
            </section>

            {/* Section: Explainability */}
            <section
              id="explain"
              ref={el => { sectionRefs.current['explain'] = el; }}
              className="space-y-4"
            >
              <SectionHeader
                icon={<Brain className="w-5 h-5 text-teal-400" />}
                title="Step 6: Explainability Engine"
                subtitle="Human-readable reasoning for TrustPatch's decision"
              />
              <ExplainabilityCard
                explanation={eval_.explanation}
                comparisonSummary={eval_.comparison_summary}
                trustScore={eval_.trustpatch.trust_score}
                selectedPatch={eval_.trustpatch.selected_patch}
              />
            </section>

            {/* Run Again Button */}
            <div className="flex justify-center py-8">
              <button
                onClick={() => setState(prev => ({ ...prev, phase: 'upload', evaluation: null, error: null }))}
                className="btn-trust text-white flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Run Another Evaluation
              </button>
            </div>
          </>
        )}
      </main>

      {/* ======================================================
          FOOTER
          ====================================================== */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        <p>TrustPatch Research Prototype • Trust-Aware APR Framework • All computations run locally</p>
      </footer>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function SectionHeader({ icon, title, subtitle }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      <div className="text-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 justify-center">
          {icon}
          {title}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
    </div>
  );
}

function WinnerBanner({
  baseline, trustpatch, trustScore, agreed, baprTrap, baprPassRate
}: {
  baseline: string; trustpatch: string; trustScore: number;
  agreed: boolean; baprTrap?: boolean; baprPassRate?: number;
}) {
  const baprPct = Math.round((baprPassRate ?? 0) * 100);

  if (baprTrap && !agreed) {
    return (
      <div className="rounded-2xl p-5 border bg-gradient-to-r from-red-500/10 via-slate-900 to-teal-500/10 border-red-500/40">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-red-400 font-bold uppercase tracking-wider">⚠ BAPR Trapped By</p>
              <p className="text-2xl font-black text-red-400">{baseline}</p>
              <p className="text-xs text-red-400/70">{baprPct}% tests (test-gaming)</p>
            </div>
            <div className="text-slate-500 font-bold text-2xl">→</div>
            <div className="text-center">
              <p className="text-xs text-teal-400 font-bold uppercase tracking-wider">✓ TrustPatch Chose</p>
              <p className="text-2xl font-black text-teal-400">{trustpatch}</p>
              <p className="text-xs text-teal-400/70">Trust {trustScore.toFixed(3)} — genuine fix</p>
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center max-w-xs">
            <p className="text-sm font-bold text-white mb-1">🎯 Core Advantage Demonstrated</p>
            <p className="text-xs text-slate-400">
              BAPR's 1-criterion selection chose a dangerous memorisation patch.
              TrustPatch's 10-dimensional analysis correctly identified and rejected it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-5 border ${
      agreed ? 'bg-teal-500/10 border-teal-500/30'
             : 'bg-gradient-to-r from-indigo-500/10 via-slate-800/50 to-teal-500/10 border-slate-600'
    }`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">BAPR Selected</p>
            <p className="text-2xl font-black text-indigo-300">{baseline}</p>
          </div>
          <div className="text-slate-500 font-bold text-lg">vs</div>
          <div className="text-center">
            <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">TrustPatch Selected</p>
            <p className="text-2xl font-black text-teal-300">{trustpatch}</p>
          </div>
        </div>
        <div className="text-center">
          {agreed ? (
            <div className="flex items-center gap-2 text-teal-400">
              <span className="text-2xl">🤝</span>
              <div>
                <p className="font-bold">Both Agreed!</p>
                <p className="text-xs text-slate-400">TrustPatch validates with trust score {trustScore.toFixed(3)}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-bold text-teal-400">TrustPatch picked a BETTER patch</p>
                <p className="text-xs text-slate-400">trust={trustScore.toFixed(3)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
