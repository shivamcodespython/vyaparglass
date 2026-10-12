'use client';

import React, { useState } from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import { Key, Shield, Zap, RefreshCw, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react';

export function SettingsView() {
  const { useMockMode, setUseMockMode, showToast } = useBizLink();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestSerpApi = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/search-businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'LED Bulbs',
          location: 'Ambala',
          radiusKm: 20,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult(
          `Success: Connected via ${data.source}. Returned ${data.totalResults} results in ${data.latencyMs}ms. Query executed: "${data.serpApiQueryUsed}"`
        );
        showToast('SerpApi Status', `API operational. Mode: ${data.source}`, 'success');
      } else {
        setTestResult(`Error: ${data.error || 'Request failed'}`);
      }
    } catch (err) {
      setTestResult(`Error: ${err instanceof Error ? err.message : 'Failed to connect'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">
            SerpApi & Platform Settings
          </h3>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure external search discovery parameters, API environment variables, and sandbox modes
        </p>
      </div>

      {/* SerpApi Environment Security Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">SerpApi Backend Engine</h4>
              <p className="text-xs text-slate-500">Secure server-side search abstraction layer</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Isolated in Node.js Runtime
          </span>
        </div>

        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
          <div className="text-slate-400">// Server Environment Configuration (.env.local)</div>
          <div className="text-emerald-400">SERPAPI_KEY=********************************</div>
          <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-800">
            Protected: API key is never exposed to the client-side JavaScript bundle. Requests proxy through <code>/api/search-businesses</code>.
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={useMockMode}
              onChange={e => setUseMockMode(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Force Offline Realistic Mock Mode (Hackathon Sandbox)</span>
          </label>

          <button
            onClick={handleTestSerpApi}
            disabled={isTesting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Testing Search API...' : 'Test Search Endpoint'}
          </button>
        </div>

        {testResult && (
          <div className={`p-3.5 rounded-xl text-xs font-mono border ${
            testResult.startsWith('Success')
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {testResult}
          </div>
        )}
      </div>

      {/* Architecture & Discovery Guide */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-indigo-600" />
          How BizLink SerpApi Discovery Operates
        </h4>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
          <li><strong>Query Synthesizer:</strong> Combines requested product, target location, and supply role into high-precision Google Maps / Local queries (e.g. <code>"wholesale LED bulbs in Ambala"</code>).</li>
          <li><strong>Entity Extraction:</strong> Converts raw SerpApi Google Local Place items into structured B2B cards, deriving wholesale roles, GST registration placeholders, and MOQs.</li>
          <li><strong>Network Bridge:</strong> When a business is saved as a supplier, BizLink updates the multi-tier supply chain graph in real-time.</li>
          <li><strong>Zero-Fail Fallback:</strong> If no API key is provided, the platform automatically serves contextually enriched local B2B directory data for instant hackathon demonstrations.</li>
        </ul>
      </div>
    </div>
  );
}
