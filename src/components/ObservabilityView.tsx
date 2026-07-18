import React, { useState } from 'react';
import {
  FileText,
  Search,
  Sliders,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  PlayCircle,
  HelpCircle,
  Clock,
  Database,
  Layers,
  ArrowRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { MonitoringLog, TraceFlow, TraceSpan } from '../types';

interface ObservabilityViewProps {
  logs: MonitoringLog[];
  traces: TraceFlow[];
  onTriggerAuditLog: (action: string) => void;
}

export default function ObservabilityView({
  logs,
  traces,
  onTriggerAuditLog
}: ObservabilityViewProps) {
  const [activeTab, setActiveTab ] = useState<'logs' | 'traces'>('logs');

  // Logs filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const [selectedProvider, setSelectedProvider] = useState<'all' | 'aws' | 'gcp' | 'azure'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // AI Diagnostic response loading states
  const [aiAnalysisLogId, setAiAnalysisLogId] = useState<string | null>(null);
  const [aiLogResult, setAiLogResult] = useState<string | null>(null);
  const [isAiLogDiagnosing, setIsAiLogDiagnosing] = useState(false);

  // Tracing selection state
  const [selectedTraceId, setSelectedTraceId] = useState<string>(traces[0]?.traceId || '');
  const [aiTraceResult, setAiTraceResult] = useState<string | null>(null);
  const [isAiTraceAnalyzing, setIsAiTraceAnalyzing] = useState(false);

  // Filtered log events compiler
  const filteredLogs = logs.filter(log => {
    const sMatches =
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.component.toLowerCase().includes(searchQuery.toLowerCase());
    const lMatches = selectedLevel === 'all' || log.level === selectedLevel;
    const pMatches = selectedProvider === 'all' || log.provider === selectedProvider;
    return sMatches && lMatches && pMatches;
  });

  const selectedTrace = traces.find(t => t.traceId === selectedTraceId) || traces[0];

  // AI log diagnostic caller
  const handleDiagnoseLog = async (log: MonitoringLog) => {
    setAiAnalysisLogId(log.id);
    setIsAiLogDiagnosing(true);
    setAiLogResult(null);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'log', payload: log })
      });
      const data = await res.json();
      if (data.analysis) {
        setAiLogResult(data.analysis);
        onTriggerAuditLog(`Executed AI SRE log diagnostics on log ID: ${log.id}`);
      } else {
        setAiLogResult('No recommendation analysis output received from GoogleGenAI analyzer.');
      }
    } catch (err: any) {
      setAiLogResult(`Diagnostic service offline or credential invalid: ${err.message}`);
    } finally {
      setIsAiLogDiagnosing(false);
    }
  };

  // AI Trace bottleneck analysis caller
  const handleAnalyzeTrace = async (trace: TraceFlow) => {
    setIsAiTraceAnalyzing(true);
    setAiTraceResult(null);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'trace', payload: trace })
      });
      const data = await res.json();
      if (data.analysis) {
        setAiTraceResult(data.analysis);
        onTriggerAuditLog(`Executed AI Distributed Trace APM audit on trace ID: ${trace.traceId}`);
      } else {
        setAiTraceResult('Uncompleted analysis payload compiled from Gemini controller.');
      }
    } catch (err: any) {
      setAiTraceResult(`Trace diagnostic failure: ${err.message}`);
    } finally {
      setIsAiTraceAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="observability-observability">
      {/* Sub tabs navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D333B] pb-3">
        <div className="flex bg-[#151921] p-1 rounded border border-[#2D333B] gap-1">
          <button
            id="tab-obs-logs"
            onClick={() => {
              setActiveTab('logs');
              setAiLogResult(null);
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'logs' ? 'bg-[#2D333B] text-blue-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Log Aggregator Engine
          </button>
          <button
            id="tab-obs-traces"
            onClick={() => {
              setActiveTab('traces');
              setAiTraceResult(null);
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'traces' ? 'bg-[#2D333B] text-blue-400 font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            Distributed Tracing MAP (APM)
          </button>
        </div>

        <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
          <Terminal className="h-3.5 w-3.5 text-blue-500" /> OpenTelemetry Core 1.2
        </span>
      </div>

      {activeTab === 'logs' ? (
        <div className="space-y-4" id="log-engine-container">
          {/* Filters controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-lg border border-[#2D333B] bg-[#151921] relative">
            {/* Search inputs */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="text"
                id="search-logs"
                placeholder="Search logs by message, namespace, error component..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium pl-9 bg-[#0B0E14] border border-[#2D333B] rounded p-2.5 text-gray-200 outline-none focus:border-blue-500"
              />
            </div>

            {/* Level Dropdown */}
            <div>
              <select
                id="filter-log-level"
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value as any)}
                className="w-full text-xs bg-[#0B0E14] border border-[#2D333B] rounded p-2.5 text-gray-300 outline-none focus:border-blue-500 uppercase font-bold"
              >
                <option value="all">Severity: All Levels</option>
                <option value="info">INFO</option>
                <option value="warning">WARNING</option>
                <option value="error">ERROR</option>
              </select>
            </div>

            {/* Provider Dropdown */}
            <div>
              <select
                id="filter-log-provider"
                value={selectedProvider}
                onChange={e => setSelectedProvider(e.target.value as any)}
                className="w-full text-xs bg-[#0B0E14] border border-[#2D333B] rounded p-2.5 text-gray-300 outline-none focus:border-blue-500 uppercase font-bold"
              >
                <option value="all">Provider: All Clouds</option>
                <option value="aws">AWS</option>
                <option value="gcp">GCP</option>
                <option value="azure">Azure</option>
              </select>
            </div>
          </div>

          {/* Logs terminal block list */}
          <div className="border border-[#2D333B] rounded-lg overflow-hidden bg-[#0B0E14] text-gray-300 font-mono text-[11.5px] leading-relaxed">
            {/* Terminal header */}
            <div className="bg-[#151921] p-3 border-b border-[#2D333B] flex items-center justify-between text-[10px] text-gray-550 uppercase font-bold tracking-wider">
              <span>Ingested Events Feed ({filteredLogs.length} matching events)</span>
              <span>UTC Aggregation Tunnel</span>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="h-10 w-10 text-gray-600 mx-auto opacity-40 mb-2" />
                No log messages matched the target configuration filters.
              </div>
            ) : (
              <div className="divide-y divide-[#2D333B]/40">
                {filteredLogs.map(log => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <div
                      key={log.id}
                      className={`transition-colors ${
                        isExpanded ? 'bg-[#151921]/30' : 'hover:bg-[#151921]/15'
                      }`}
                      id={`log-row-${log.id}`}
                    >
                      {/* Log line summary */}
                      <div
                        onClick={() => {
                          setExpandedLogId(isExpanded ? null : log.id);
                          // Clear AI results state on toggle
                          if (log.id !== expandedLogId) {
                            setAiLogResult(null);
                          }
                        }}
                        className="p-3 flex items-start gap-3 cursor-pointer select-none"
                      >
                        {/* Level Indicator Tag */}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 tracking-widest text-center w-[65px] ${
                          log.level === 'error'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : log.level === 'warning'
                            ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                            : 'bg-[#151921] text-gray-400 border border-[#2D333B]/80'
                        }`}>
                          {log.level}
                        </span>

                        {/* Timestamp */}
                        <span className="text-gray-500 text-[10.5px] shrink-0 font-medium">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>

                        {/* Resource identifier */}
                        <span className="text-gray-450 font-bold shrink-0">
                          [{log.service.toUpperCase()}]
                        </span>

                        {/* Ingestion message summary */}
                        <span className={`text-[#E0E0E0] truncate ${log.level === 'error' ? 'font-semibold text-rose-100' : ''}`}>
                          {log.message}
                        </span>
                      </div>

                      {/* Log expansion panel */}
                      {isExpanded && (
                        <div className="p-5 bg-[#151921] border-t border-[#2D333B] space-y-4 animate-fade-in">
                          {/* Metadata row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                              <span className="text-gray-500 font-bold uppercase text-[9px]">Cloud Provider</span>
                              <div className="text-gray-300 font-semibold mt-0.5 uppercase">{log.provider}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 font-bold uppercase text-[9px]">Resource Target</span>
                              <div className="text-gray-300 font-semibold mt-0.5 font-mono">{log.resourceId}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 font-bold uppercase text-[9px]">Component Module</span>
                              <div className="text-gray-300 font-semibold mt-0.5 font-mono">{log.component}</div>
                            </div>
                            <div>
                              <span className="text-gray-500 font-bold uppercase text-[9px]">Complete Timestamp</span>
                              <div className="text-gray-450 font-mono mt-0.5">{log.timestamp}</div>
                            </div>
                          </div>

                          {/* Raw JSON Payload */}
                          <div className="space-y-1">
                            <span className="text-gray-550 font-bold uppercase text-[9px]">Raw Process JSON Metadata</span>
                            <pre className="p-3 rounded-lg bg-[#0B0E14] border border-[#2D333B] text-[10.5px] text-blue-400 overflow-x-auto whitespace-pre-wrap max-h-40 font-mono">
                              {JSON.stringify(JSON.parse(log.payload), null, 2)}
                            </pre>
                          </div>

                          {/* Gemini AI diagnostic trigger */}
                          <div className="pt-3 border-t border-[#2D333B]/60">
                            {aiLogResult ? (
                              <div className="p-4 rounded bg-[#0B0E14] border border-[#2D333B] space-y-3 leading-relaxed font-sans text-xs">
                                <div className="flex items-center gap-2 text-blue-400 font-semibold border-b border-[#2D333B]/65 pb-2">
                                  <Zap className="h-4 w-4 text-emerald-450" /> SRE AI CoPilot Outage Resolution Plan
                                </div>
                                <div className="text-gray-300 text-xs space-y-2 leading-relaxed">
                                  {aiLogResult.split('\n').map((line, idx) => {
                                    if (line.startsWith('###')) {
                                      return <h4 key={idx} className="text-xs font-bold text-blue-450 mt-2">{line.replace('###', '')}</h4>;
                                    }
                                    if (line.startsWith('**')) {
                                      return <p key={idx} className="text-gray-200"><strong className="text-white">{line.replaceAll('**', '')}</strong></p>;
                                    }
                                    return <p key={idx} className="text-gray-300">{line}</p>;
                                  })}
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                id={`btn-ai-diagnose-${log.id}`}
                                disabled={isAiLogDiagnosing}
                                onClick={() => handleDiagnoseLog(log)}
                                className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-750 text-white font-bold px-4 py-2 rounded text-[11px] transition-colors cursor-pointer disabled:opacity-50 font-sans uppercase"
                              >
                                {isAiLogDiagnosing ? (
                                  <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                                    Synthesizing AI Audit...
                                  </>
                                ) : (
                                  <>
                                    <Zap className="h-3.5 w-3.5 fill-white text-white" />
                                    Troubleshoot with Gemini AI
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="trace-engine-container">
          {/* Traces Feed List Sidebar */}
          <div className="lg:col-span-1 p-4.5 rounded-lg border border-[#2D333B] bg-[#151921] flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Live Transaction Spans ({traces.length})
              </h3>
              <div className="space-y-2">
                {traces.map(trace => (
                  <div
                    key={trace.traceId}
                    id={`trace-card-${trace.traceId}`}
                    onClick={() => {
                      setSelectedTraceId(trace.traceId);
                      setAiTraceResult(null);
                    }}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      selectedTraceId === trace.traceId
                        ? 'border-emerald-550/65 bg-emerald-950/10 border-l-4 border-l-emerald-500 shadow-sm'
                        : 'border-[#2D333B] bg-[#0B0E14] hover:border-gray-750'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#E2E8F0]">{trace.rootServiceName}</span>
                      <span className={trace.status === 'ok' ? 'text-emerald-450' : 'text-rose-400 font-semibold'}>
                        {trace.totalDurationMs}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-2">
                      <span>Trace: {trace.traceId.slice(3, 11)}</span>
                      <span>{new Date(trace.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#2D333B]/50 text-[10px]">
                      <span className="text-gray-500">Nodes: {trace.spans.length}</span>
                      <span className={`px-1.5 py-0.5 rounded uppercase font-bold text-[8px] ${
                        trace.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-455'
                      }`}>
                        {trace.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trace Timeline Gantt Chart Visualizer */}
          <div className="lg:col-span-2 p-5 rounded-lg border border-[#2D333B] bg-[#151921] flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D333B] pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  OpenTelemetry Span Topology Gantt
                </h3>
                <p className="text-xs text-gray-450 font-mono">Trace: ID {selectedTrace.traceId}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-500">Total Latency Call</span>
                <div className="text-base font-bold font-mono text-emerald-400">
                  {selectedTrace.totalDurationMs} ms
                </div>
              </div>
            </div>

            {/* Interactive Hierarchy Chart Node Flow */}
            <div className="space-y-3.5" id="trace-hierarchy-chart">
              {selectedTrace.spans.map((span, index) => {
                const stepPercent = Math.max(10, (span.durationMs / selectedTrace.totalDurationMs) * 100);
                // Indent level based on parent presence simulation
                const indentOffset = span.parentSpanId ? 'ml-6 border-l border-[#2D333B] pl-3' : '';

                return (
                  <div
                    key={span.id}
                    className={`p-3 rounded bg-[#0B0E14] border border-[#2D333B] relative overflow-hidden flex flex-col justify-between hover:border-gray-750 transition-colors ${indentOffset}`}
                    id={`span-card-${span.id}`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-300 flex items-center gap-1.5 font-semibold">
                        {span.status === 'ok' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        )}
                        {span.name} <span className="text-[10px] text-gray-500 font-normal">({span.serviceName})</span>
                      </span>

                      <span className="text-[10.5px] font-mono text-gray-400">
                        {span.durationMs} ms
                      </span>
                    </div>

                    {/* Proportional duration metrics bar */}
                    <div className="w-full bg-[#151921] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          span.status === 'ok' ? 'bg-emerald-500/70' : 'bg-rose-500/80 animate-pulse'
                        }`}
                        style={{ width: `${stepPercent}%` }}
                      ></div>
                    </div>

                    {/* Metadata attributes row */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-2 pt-1.5 border-t border-[#2D333B]/40">
                      <span>ID: {span.id}</span>
                      <div className="flex gap-2 text-[9px] text-blue-400 max-w-sm truncate">
                        {Object.entries(span.attributes).slice(0, 2).map(([k, v]) => (
                          <span key={k}>{k}={v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Call Tree Outage Bottleneck Explainer */}
            <div className="mt-6 border-t border-[#2D333B] pt-4" id="apm-copilot-panel">
              {aiTraceResult ? (
                <div className="p-4 rounded bg-[#0B0E14] border border-[#2D333B] space-y-3 leading-relaxed font-sans text-xs">
                  <div className="flex items-center gap-2 text-blue-450 font-semibold border-b border-[#2D333B] pb-2">
                    <Zap className="h-4 w-4 text-emerald-450 animate-pulse" /> Gemini AI Distributed Trace Insights
                  </div>
                  <div className="text-gray-300 text-xs space-y-2 leading-relaxed">
                    {aiTraceResult.split('\n').map((line, idx) => {
                      if (line.startsWith('###')) {
                        return <h4 key={idx} className="text-xs font-bold text-blue-455 mt-2">{line.replace('###', '')}</h4>;
                      }
                      return <p key={idx}>{line}</p>;
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-[#0B0E14] p-4 border border-[#2D333B] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#E0E0E0]">Trace Outage Analysis</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-sans">
                      Examine trace hierarchy call trees to identify SQL deadlocks, network starvation, and microservice timeouts.
                    </p>
                  </div>
                  <button
                    id="btn-ai-analyze-trace"
                    disabled={isAiTraceAnalyzing}
                    onClick={() => handleAnalyzeTrace(selectedTrace)}
                    className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-750 text-white font-bold px-4 py-2 rounded text-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isAiTraceAnalyzing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                        Auditing call tree...
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 fill-white text-white" />
                        Diagnose Bottleneck (AI)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
