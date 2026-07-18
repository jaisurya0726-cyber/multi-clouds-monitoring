import React, { useState } from 'react';
import {
  AlertTriangle,
  PlayCircle,
  CheckCircle2,
  Bell,
  Sliders,
  Settings,
  Mail,
  Slack,
  Webhook,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  Zap,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';
import { AlertRule, ActiveIncident, CloudProvider } from '../types';

interface AlertingViewProps {
  alertRules: AlertRule[];
  activeIncidents: ActiveIncident[];
  onAddAlertRule: (rule: AlertRule) => void;
  onResolveIncident: (incidentId: string) => void;
  onAcknowledgeIncident: (incidentId: string) => void;
  onTriggerAlert: (ruleType: string) => void;
  onTriggerAuditLog: (action: string) => void;
}

export default function AlertingView({
  alertRules,
  activeIncidents,
  onAddAlertRule,
  onResolveIncident,
  onAcknowledgeIncident,
  onTriggerAlert,
  onTriggerAuditLog
}: AlertingViewProps) {
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);

  // New Rule State
  const [ruleName, setRuleName] = useState('');
  const [provider, setProvider] = useState<'all' | CloudProvider>('all');
  const [resourceType, setResourceType] = useState<'vm' | 'database' | 'k8s_cluster' | 'all'>('vm');
  const [metric, setMetric] = useState<'cpu' | 'memory' | 'disk_util' | 'network_spike' | 'cost_spike'>('cpu');
  const [operator, setOperator] = useState<'gt' | 'lt'>('gt');
  const [threshold, setThreshold] = useState(85);
  const [windowMin, setWindowMin] = useState(5);
  const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('warning');

  // Channels checkboxes
  const [email, setEmail] = useState(true);
  const [slack, setSlack] = useState(true);
  const [teams, setTeams] = useState(false);
  const [webhook, setWebhook] = useState(false);

  // AI Mitigation State
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isMitigating, setIsMitigating] = useState(false);
  const [aiMitigationPlan, setAiMitigationPlan] = useState<string | null>(null);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const newRule: AlertRule = {
      id: `rule-${Math.random().toString(36).substring(2, 7)}`,
      name: ruleName,
      provider,
      resourceType,
      metric,
      operator,
      threshold,
      evaluationWindowMin: windowMin,
      severity,
      notificationChannels: { email, slack, teams, webhook },
      isActive: true
    };

    onAddAlertRule(newRule);
    onTriggerAuditLog(`Created new cloud Alert Rule metrics threshold: ${ruleName}`);

    // Reset Form
    setRuleName('');
    setShowAddRuleForm(false);
  };

  const handleFetchMitigation = async (incident: ActiveIncident) => {
    setSelectedIncidentId(incident.id);
    setIsMitigating(true);
    setAiMitigationPlan(null);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'alert', payload: incident })
      });
      const data = await res.json();
      if (data.analysis) {
        setAiMitigationPlan(data.analysis);
        onTriggerAuditLog(`Triggered Gemini AI mitigation playbook generation on incident: ${incident.id}`);
      } else {
        setAiMitigationPlan('Failed to compile a remediation path template.');
      }
    } catch (err: any) {
      setAiMitigationPlan(`Playbook generator is temporarily unavailable: ${err.message}`);
    } finally {
      setIsMitigating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="alerts-control-panel-view">
      {/* Simulation triggers and header banner */}
      <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2" id="alerts-title-head">
            <Bell className="h-5 w-5 text-rose-450" /> Active Outages & Alert Rule Thresholds
          </h2>
          <p className="text-[11px] text-gray-450 mt-1">
            Real-time threshold engine checking active incidents, routing through Slack and Webhook notifications.
          </p>
        </div>

        <button
          id="btn-show-add-rule"
          onClick={() => setShowAddRuleForm(!showAddRuleForm)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-750 text-white px-4 py-2.5 rounded text-xs font-semibold cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          {showAddRuleForm ? 'Close Rule Form' : 'Synthesize Custom Alert Rule'}
        </button>
      </div>

      {showAddRuleForm && (
        <form
          id="alert-rule-creation-form"
          onSubmit={handleCreateRule}
          className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#2D333B] pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Create Infrastructure Alarm Metric Checklist
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">Aggregation Evaluator 1.1</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inputs Block */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                  Alarm Rule Descriptor Name
                </label>
                <input
                  type="text"
                  id="rule-name-input"
                  required
                  placeholder="e.g. Critical Aurora database transaction pool overload"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  className="w-full text-xs bg-[#0B0E14] border border-[#2D333B]/80 focus:border-[#2563EB] rounded p-2.5 text-gray-200 outline-none"
                />
              </div>

              {/* Group selection parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                    Cloud Provider Limit
                  </label>
                  <select
                    id="rule-select-provider"
                    value={provider}
                    onChange={e => setProvider(e.target.value as any)}
                    className="w-full text-xs bg-[#0B0E14] border border-[#2D333B] rounded p-2.5 text-gray-300 outline-none"
                  >
                    <option value="all">All Cloud Providers</option>
                    <option value="aws">AWS EC2/Aurora Only</option>
                    <option value="gcp">GCP Spanner/Storage Only</option>
                    <option value="azure">Azure VM/Cosmos Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                    Telemetry Resource Type
                  </label>
                  <select
                    id="rule-select-res-type"
                    value={resourceType}
                    onChange={e => setResourceType(e.target.value as any)}
                    className="w-full text-xs bg-[#0B0E14] border border-[#2D333B] rounded p-2.5 text-gray-300 outline-none"
                  >
                    <option value="vm">Virtual Servers</option>
                    <option value="database">Core Databases</option>
                    <option value="k8s_cluster">Kubernetes Cluster Pods</option>
                    <option value="all">Unrestricted All Resources</option>
                  </select>
                </div>
              </div>

              {/* Trigger Logic params */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#0B0E14] rounded border border-[#2D333B]/60">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500 block">
                    Target Metric
                  </label>
                  <select
                    id="rule-select-metric"
                    value={metric}
                    onChange={e => setMetric(e.target.value as any)}
                    className="w-full text-[10.5px] bg-[#151921] border border-[#2D333B] rounded p-1.5 text-gray-300 outline-none"
                  >
                    <option value="cpu">CPU Util (%)</option>
                    <option value="memory">RAM Util (%)</option>
                    <option value="disk_util">Disk Util (%)</option>
                    <option value="network_spike">Network Influx (MB/s)</option>
                    <option value="cost_spike">Cost Inflation (%)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500 block">
                    Operator
                  </label>
                  <select
                    id="rule-select-operator"
                    value={operator}
                    onChange={e => setOperator(e.target.value as any)}
                    className="w-full text-[10.5px] bg-[#151921] border border-[#2D333B] rounded p-1.5 text-gray-300 outline-none font-bold"
                  >
                    <option value="gt">&gt; (Is Greater)</option>
                    <option value="lt">&lt; (Is Less)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500 block">
                    Value Limit
                  </label>
                  <input
                    type="number"
                    id="rule-threshold-input"
                    value={threshold}
                    onChange={e => setThreshold(Number(e.target.value))}
                    className="w-full text-[10.5px] bg-[#151921] border border-[#2D333B] rounded p-1.5 text-gray-200 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Channels block */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                    Evaluating Window Target
                  </label>
                  <input
                    type="number"
                    id="rule-window-input"
                    value={windowMin}
                    placeholder="e.g. 5 mins"
                    onChange={e => setWindowMin(Number(e.target.value))}
                    className="w-full text-xs bg-[#0B0E14] border border-[#2D333B] rounded p-2.5 text-gray-200 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                    Alarm Severity Classification
                  </label>
                  <select
                    id="rule-select-severity"
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full text-xs bg-[#0B0E14] border border-[#2D333B] rounded p-2.5 text-gray-300 outline-none font-mono uppercase font-semibold"
                  >
                    <option value="info">INFO</option>
                    <option value="warning">WARNING</option>
                    <option value="critical">CRITICAL</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes routing channels */}
              <div className="space-y-2 p-3.5 bg-[#0B0E14] rounded border border-[#2D333B]">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-2">
                  Immediate Notification Channels
                </label>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={email}
                      onChange={e => setEmail(e.target.checked)}
                      className="rounded border-[#2D333B] accent-[#2563EB]"
                    />
                    <Mail className="h-3.5 w-3.5 text-indigo-455" /> SRE Email Dispatch
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={slack}
                      onChange={e => setSlack(e.target.checked)}
                      className="rounded border-[#2D333B] accent-[#2563EB]"
                    />
                    <Slack className="h-3.5 w-3.5 text-emerald-450" /> Slack Channel Hook
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={webhook}
                      onChange={e => setWebhook(e.target.checked)}
                      className="rounded border-[#2D333B] accent-[#2563EB]"
                    />
                    <Webhook className="h-3.5 w-3.5 text-amber-500" /> API Webhook endpoint
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  id="btn-rule-cancel"
                  onClick={() => setShowAddRuleForm(false)}
                  className="px-4 py-2 rounded text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-rule-submit"
                  className="bg-[#2563EB] hover:bg-blue-750 text-white px-5 py-2 rounded text-xs font-bold cursor-pointer transition-colors"
                >
                  Confirm Threshold Allocation Rule
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Active Outage Incidents Section */}
      <div className="space-y-4 animate-fade-in">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" id="active-incidents">
          Active Reliability Incidents Radar ({activeIncidents.length})
        </h3>

        {activeIncidents.length === 0 ? (
          <div className="p-8 rounded border border-emerald-500/20 bg-[#151921] text-center text-emerald-400 text-xs font-semibold flex flex-col items-center gap-2">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            No active alerts detected. All cloud metrics are holding within safety limits.
          </div>
        ) : (
          <div className="space-y-4" id="list-incidents">
            {activeIncidents.map(inc => {
              const isSelected = selectedIncidentId === inc.id;

              return (
                <div
                  key={inc.id}
                  id={`incident-item-${inc.id}`}
                  className={`border rounded-lg overflow-hidden transition-all duration-300 bg-[#151921] ${
                    inc.severity === 'critical'
                      ? 'border-red-500/35 shadow-lg shadow-red-950/5'
                      : 'border-amber-500/20'
                  }`}
                >
                  {/* Alert header details */}
                  <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${
                    inc.severity === 'critical' ? 'border-red-500/10 bg-[#0B0E14]' : 'border-[#2D333B] bg-[#0B0E14]'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded shrink-0 ${
                        inc.severity === 'critical' ? 'bg-red-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-450'
                      }`}>
                        <AlertTriangle className="h-4.5 w-4.5 animate-bounce" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            inc.severity === 'critical'
                              ? 'bg-rose-500/10 text-rose-450 border border-rose-550/20'
                              : 'bg-amber-500/10 text-amber-450 border border-amber-550/20'
                          }`}>
                            {inc.severity}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500">
                            ID: {inc.id}
                          </span>
                          <span className="text-[10px] font-mono text-gray-550">
                            Time: {new Date(inc.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white mt-1.5">{inc.name}</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5 font-semibold">
                          Target: <span className="text-gray-200">{inc.resourceName}</span> ({inc.provider.toUpperCase()})
                        </p>
                      </div>
                    </div>

                    {/* Controls Actions button */}
                    <div className="flex flex-wrap items-center gap-2 sm:self-center shrink-0">
                      <h5 className="text-[10px] font-mono text-gray-400 bg-[#0B0E14] p-2.5 rounded border border-[#2D333B] leading-relaxed text-right mr-2 select-none">
                        Current: <span className="text-rose-400 font-bold">{inc.currentValue}</span> <span className="text-gray-500">(Threshold: {inc.thresholdValue})</span>
                      </h5>

                      {inc.status === 'active' && (
                        <button
                          type="button"
                          id={`btn-ack-${inc.id}`}
                          onClick={() => {
                            onAcknowledgeIncident(inc.id);
                            onTriggerAuditLog(`SRE team Acknowledged live cloud alert outage: ${inc.name}`);
                          }}
                          className="bg-[#2D333B] hover:bg-[#2D333B]/80 text-[#E0E0E0] border border-[#2D333B]/50 font-bold px-3 py-2 rounded text-xs transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}

                      <button
                        type="button"
                        id={`btn-resolve-${inc.id}`}
                        onClick={() => {
                          onResolveIncident(inc.id);
                          onTriggerAuditLog(`SRE manual mitigation applied. Resolved outlier incident: ${inc.name}`);
                          setAiMitigationPlan(null);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-750 text-white font-bold px-3.5 py-2 rounded text-xs transition-colors cursor-pointer"
                      >
                        Resolve Alert
                      </button>
                    </div>
                  </div>

                  {/* AI mitigation recommendations drawer */}
                  <div className="p-4 bg-[#0B0E14] text-xs text-gray-400 leading-relaxed space-y-4">
                    {/* Diagnostic instruction description */}
                    <div className="border-l-2 border-[#2D333B] pl-3">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">
                        <span>Incident Context summary</span>
                        <span className="capitalize text-slate-300 font-bold bg-[#151921] px-1.5 py-0.5 rounded border border-[#2D333B]/60 font-mono">
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-gray-400">
                        The real-time telemetry metrics scanner registered an alarm condition when {inc.metricName} breached the safety configuration guidelines limit. Corrective instructions below.
                      </p>
                    </div>

                    {/* Playbook Result */}
                    {isSelected && aiMitigationPlan ? (
                      <div className="p-4 rounded bg-[#151921] border border-[#2D333B] space-y-3 font-sans text-xs">
                        <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-[#2D333B] pb-2">
                          <Zap className="h-4 w-4 text-emerald-400" /> Gemini AI Outage Plan Response
                        </div>
                        <div className="text-gray-300 space-y-2 leading-relaxed">
                          {aiMitigationPlan.split('\n').map((line, idx) => {
                            if (line.startsWith('###')) {
                              return <h4 key={idx} className="text-xs font-semibold text-blue-400 mt-2">{line.replace('###', '')}</h4>;
                            }
                            if (line.trim().startsWith('-') || line.trim().startsWith('1.')) {
                              return <li key={idx} className="text-gray-300 ml-4">{line.replace(/^-\s*|^\d+\.\s*/, '')}</li>;
                            }
                            return <p key={idx}>{line}</p>;
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#2D333B]/40">
                        <span className="text-[10px] text-gray-500 font-medium">Need immediate command line procedures?</span>
                        <button
                          type="button"
                          id={`btn-mitigate-incident-${inc.id}`}
                          disabled={isMitigating && selectedIncidentId === inc.id}
                          onClick={() => handleFetchMitigation(inc)}
                          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-750 text-white font-bold px-3 py-1.5 rounded text-[10.5px] transition-colors cursor-pointer disabled:opacity-50 font-sans"
                        >
                          {isMitigating && selectedIncidentId === inc.id ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                              Synthesizing playbook guides...
                            </>
                          ) : (
                            <>
                              <Zap className="h-3.5 w-3.5 fill-white text-white" />
                              Suggest Playbook Actions (AI)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alarm rules definitions registry list */}
      <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921]" id="alerts-rules-grid">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wide text-xs font-bold text-gray-400">
          Configured Central Metrics Alarm Rules ({alertRules.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertRules.map(rule => (
            <div
              key={rule.id}
              id={`rule-card-${rule.id}`}
              className="p-4 rounded-lg border border-[#2D333B] bg-[#0B0E14] flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                    rule.provider === 'all'
                      ? 'bg-slate-800 text-gray-400'
                      : rule.provider === 'aws'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                  }`}>
                    {rule.provider}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                    rule.severity === 'critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-450 border border-amber-550/20'
                  }`}>
                    {rule.severity}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#E0E0E0]">{rule.name}</h4>

                <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                  <span>Trigger:</span>
                  <span className="text-gray-400 font-bold uppercase">{rule.metric.replace('_', ' ')}</span>
                  <span>{rule.operator === 'gt' ? '>' : '<'}</span>
                  <span className="text-[#F87171] font-bold">{rule.threshold}</span>
                  <span>window {rule.evaluationWindowMin}m</span>
                </div>

                {/* Connected Channels List */}
                <div className="flex flex-wrap gap-1.5 text-[9px] pt-1.5 border-t border-[#2D333B]/40 text-gray-500 font-semibold">
                  <span>Channels:</span>
                  {rule.notificationChannels.email && <span className="flex items-center gap-0.5 text-indigo-400"><Check className="h-2.5 w-2.5" /> Email</span>}
                  {rule.notificationChannels.slack && <span className="flex items-center gap-0.5 text-emerald-450"><Check className="h-2.5 w-2.5" /> Slack</span>}
                  {rule.notificationChannels.webhook && <span className="flex items-center gap-0.5 text-amber-500"><Check className="h-2.5 w-2.5" /> Webhook</span>}
                </div>
              </div>

              <div className="flex items-center gap-1 self-start shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                  rule.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-550/25' : 'bg-slate-800 text-slate-500'
                }`}>
                  {rule.isActive ? 'ACTIVE' : 'MUTED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
