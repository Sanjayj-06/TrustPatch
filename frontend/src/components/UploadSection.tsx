/**
 * components/UploadSection.tsx
 * ----------------------------
 * Drag-and-drop file upload section for buggy Python file + test file.
 * Uses react-dropzone for drag & drop functionality.
 * Shows file preview, validation feedback, and upload progress.
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileCode, TestTube, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface UploadSectionProps {
  onUpload: (buggyFile: File, testFile: File) => Promise<void>;
  isLoading: boolean;
}

interface FileState {
  file: File | null;
  error: string | null;
}

// Pre-built sample files for demo purposes
const SAMPLE_BUGGY_CODE = `# Sample buggy Python file
def calculate_average(numbers):
    """Calculate the average of a list of numbers."""
    total = 0
    for i in range(len(numbers) - 1):  # BUG: off-by-one, skips last element
        total = total + numbers[i]
    return total / len(numbers)

def find_max(arr):
    """Find the maximum value in an array."""
    if arr == None:  # BUG: should use 'is None'
        return None
    max_val = arr[0]
    for i in range(1, len(arr)):
        if arr[i] > max_val:
            max_val = arr[i]
    return max_val

def is_valid_age(age):
    """Check if age is in valid range 0-120."""
    if age < 0 and age > 120:  # BUG: should be 'or' not 'and'
        return False
    return True
`;

const SAMPLE_TEST_CODE = `# Sample test file
import pytest
from module_under_test import calculate_average, find_max, is_valid_age

def test_average_basic():
    assert calculate_average([1, 2, 3, 4, 5]) == 3.0

def test_average_single():
    assert calculate_average([10]) == 10.0

def test_find_max_normal():
    assert find_max([3, 1, 4, 1, 5, 9, 2, 6]) == 9

def test_find_max_none():
    assert find_max(None) is None

def test_valid_age_normal():
    assert is_valid_age(25) == True

def test_invalid_age_negative():
    assert is_valid_age(-1) == False

def test_invalid_age_over():
    assert is_valid_age(150) == False
`;

export default function UploadSection({ onUpload, isLoading }: UploadSectionProps) {
  const [buggyFile, setBuggyFile] = useState<FileState>({ file: null, error: null });
  const [testFile, setTestFile] = useState<FileState>({ file: null, error: null });
  const [useSample, setUseSample] = useState(false);

  const onDropBuggy = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      setBuggyFile({ file: null, error: 'Only .py files are accepted' });
      return;
    }
    setBuggyFile({ file: accepted[0], error: null });
  }, []);

  const onDropTest = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      setTestFile({ file: null, error: 'Only .py files are accepted' });
      return;
    }
    setTestFile({ file: accepted[0], error: null });
  }, []);

  const { getRootProps: getBuggyProps, getInputProps: getBuggyInputProps, isDragActive: isBuggyDrag } =
    useDropzone({ onDrop: onDropBuggy, accept: { 'text/x-python': ['.py'] }, multiple: false, disabled: isLoading || useSample });

  const { getRootProps: getTestProps, getInputProps: getTestInputProps, isDragActive: isTestDrag } =
    useDropzone({ onDrop: onDropTest, accept: { 'text/x-python': ['.py'] }, multiple: false, disabled: isLoading || useSample });

  const handleSubmit = async () => {
    let bFile = buggyFile.file;
    let tFile = testFile.file;

    if (useSample) {
      bFile = new File([SAMPLE_BUGGY_CODE], 'buggy_calculator.py', { type: 'text/x-python' });
      tFile = new File([SAMPLE_TEST_CODE], 'test_calculator.py', { type: 'text/x-python' });
    }

    if (!bFile || !tFile) return;
    await onUpload(bFile, tFile);
  };

  const canSubmit = useSample || (buggyFile.file !== null && testFile.file !== null);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-full px-4 py-2 text-teal-400 text-sm font-medium mb-4">
          <Zap className="w-4 h-4" />
          Step 1: Upload Files
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Upload Your Code</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Upload a buggy Python file and its unit tests. TrustPatch will generate
          5 candidate patches and evaluate them across 10 trust dimensions.
        </p>
      </div>

      {/* Sample Demo Toggle */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">🎯 Use Sample Demo Files</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-built buggy calculator with 3 bugs and 7 unit tests
          </p>
        </div>
        <button
          onClick={() => setUseSample(!useSample)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            useSample ? 'bg-teal-500' : 'bg-slate-600'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            useSample ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {!useSample && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buggy File Drop Zone */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-red-400" />
              Buggy Python File <span className="text-red-400">*</span>
            </label>
            <div
              {...getBuggyProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isBuggyDrag
                  ? 'border-teal-400 bg-teal-500/10 scale-102'
                  : buggyFile.file
                  ? 'border-teal-500/50 bg-teal-500/5'
                  : buggyFile.error
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
              }`}
            >
              <input {...getBuggyInputProps()} />
              {buggyFile.file ? (
                <div className="space-y-2">
                  <CheckCircle className="w-10 h-10 text-teal-400 mx-auto" />
                  <p className="text-teal-400 font-semibold">{buggyFile.file.name}</p>
                  <p className="text-slate-500 text-xs">{(buggyFile.file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : buggyFile.error ? (
                <div className="space-y-2">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                  <p className="text-red-400 text-sm">{buggyFile.error}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-10 h-10 text-slate-500 mx-auto" />
                  <div>
                    <p className="text-slate-300 font-medium">Drop your buggy .py file here</p>
                    <p className="text-slate-500 text-xs mt-1">or click to browse</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Test File Drop Zone */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <TestTube className="w-4 h-4 text-indigo-400" />
              Unit Test File <span className="text-red-400">*</span>
            </label>
            <div
              {...getTestProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isTestDrag
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : testFile.file
                  ? 'border-indigo-500/50 bg-indigo-500/5'
                  : testFile.error
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
              }`}
            >
              <input {...getTestInputProps()} />
              {testFile.file ? (
                <div className="space-y-2">
                  <CheckCircle className="w-10 h-10 text-indigo-400 mx-auto" />
                  <p className="text-indigo-400 font-semibold">{testFile.file.name}</p>
                  <p className="text-slate-500 text-xs">{(testFile.file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : testFile.error ? (
                <div className="space-y-2">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                  <p className="text-red-400 text-sm">{testFile.error}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-10 h-10 text-slate-500 mx-auto" />
                  <div>
                    <p className="text-slate-300 font-medium">Drop your test .py file here</p>
                    <p className="text-slate-500 text-xs mt-1">pytest-compatible tests</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {useSample && (
        <div className="glass-card p-5 space-y-3">
          <p className="text-sm font-semibold text-teal-400 mb-3">📄 Sample Files Preview</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">buggy_calculator.py</p>
              <pre className="code-block text-xs h-32 overflow-auto">{SAMPLE_BUGGY_CODE.slice(0, 400)}...</pre>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">test_calculator.py</p>
              <pre className="code-block text-xs h-32 overflow-auto">{SAMPLE_TEST_CODE.slice(0, 400)}...</pre>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          id="run-trustpatch-btn"
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
          className="btn-trust text-white flex items-center gap-3 text-base px-10 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running TrustPatch Pipeline...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Run TrustPatch Analysis
            </>
          )}
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[
          { icon: '🔧', title: '5 Candidate Patches', desc: 'Auto-generated using rule-based transformations' },
          { icon: '📊', title: '10 Trust Parameters', desc: 'Multi-dimensional quality evaluation' },
          { icon: '🧠', title: 'AI Explainability', desc: 'Human-readable reasoning for patch selection' },
        ].map((item) => (
          <div key={item.title} className="glass-card p-4 text-center">
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
