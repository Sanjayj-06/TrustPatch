/**
 * api/trustpatch.ts
 * ------------------
 * API client layer for the TrustPatch backend.
 * Uses axios with base URL pointing to the FastAPI backend.
 *
 * All API calls are async and return typed responses.
 * Errors are normalized and re-thrown for UI handling.
 */

import axios from 'axios';
import type { UploadResponse, EvaluationResponse } from '../types';

// Base URL for the FastAPI backend
// Automatically falls back to the live Render backend if VITE_API_URL is not set in Vercel
const BASE_URL = import.meta.env.VITE_API_URL || 'https://trustpatch-1.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 minutes — trust evaluation takes time
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Upload a buggy Python file and its test file to create a session.
 *
 * @param buggyFile  - The buggy Python source file
 * @param testFile   - The unit test Python file
 * @returns UploadResponse with session_id
 */
export async function uploadFiles(
  buggyFile: File,
  testFile: File
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('buggy_file', buggyFile);
  formData.append('test_file', testFile);

  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Run the full TrustPatch evaluation (BAPR + TAPR) for a session.
 *
 * This single endpoint runs both pipelines and returns a comprehensive
 * comparison including all 5 patches, metrics, explanations, and chart data.
 *
 * @param sessionId - Session UUID from uploadFiles()
 * @returns Full EvaluationResponse
 */
export async function evaluateTrustPatch(
  sessionId: string
): Promise<EvaluationResponse> {
  const response = await api.post<EvaluationResponse>(
    '/trustpatch/evaluate',
    { session_id: sessionId }
  );
  return response.data;
}

/**
 * Fetch history of past evaluation sessions.
 *
 * @param limit - Maximum number of sessions to return (default 20)
 */
export async function fetchHistory(limit = 20) {
  const response = await api.get(`/history?limit=${limit}`);
  return response.data;
}

/**
 * Health check — verify the backend is reachable.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
}

export default api;
