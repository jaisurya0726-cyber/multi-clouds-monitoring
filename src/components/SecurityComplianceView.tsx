import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Compass,
  ArrowRight,
  RefreshCw,
  Search,
  Eye,
  Settings
} from 'lucide-react';
import { SecurityPostureCheck, CloudProvider } from '../types';

interface SecurityComplianceViewProps {
  postureChecks: SecurityPostureCheck[];
  onTriggerAuditLog: (action: string) => void;
}

export default function SecurityComplianceView({
  postureChecks,
  onTriggerAuditLog
}: SecurityComplianceViewProps) {
  const [selectedStandard, setSelectedStandard] = useState<'all' | 'ISO 27001' | 'SOC 2' | 'GDPR' | 'HIPAA'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Trigger security scan simulation loading state
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Filter security checks
  const filteredChecks = postureChecks.filter(check => {
    const sMatches = selectedStandard === 'all' || check.complianceStandards.includes(selectedStandard as any);
    const vMatches = filterSeverity === 'all' || check.severity === filterSeverity;
    return sMatches && vMatches;
  });

  // Calculate compliance score
  const total = filteredChecks.length;
  const passed = filteredChecks.filter(c => c.status === 'passed').length;
  const failed = filteredChecks.filter(c => c.status === 'failed').length;
  const warnings = filteredChecks.filter(c => c.status === 'warning').length;

  const compliancePercentage = total ? Math.round((passed / total) * 100) : 100;

  const handleTriggerSecurityAudit = () => {
    setIsScanning(true);
    setScanMessage(null);

    // Simulate Cloud Security Audit Scanning pipeline
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('Completed full security posture sweep. Evaluated 24 CIS Foundations rules across AWS, GCP, and Azure accounts. Connected security mesh successfully.');
      onTriggerAuditLog(`Initiated cloud platform security compliance posture scan.`);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="security-posture-view">
      {/* Overview scan header */}
      <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2" id="security-title-head">
            <ShieldAlert className="h-5 w-5 text-blue-450" /> Compliance & Security Posture Shield
          </h2>
          <p className="text-[11px] text-gray-450 mt-1">
            CIS foundation rules, access policy audits, global security scans, and industry standards reporting.
          </p>
        </div>

        <button
          id="btn-trigger-security-scan"
          onClick={handleTriggerSecurityAudit}
          disabled={isScanning}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-750 text-white font-bold px-4 py-2.5 rounded text-xs cursor-pointer transition-colors"
        >
          {isScanning ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
              Scanning Cloud Policies ...
            </>
          ) : (
            <>
              <Compass className="h-4 w-4 text-white" />
              Initiate Dynamic Compliance Check
            </>
          )}
        </button>
      </div>

      {scanMessage && (
        <div className="flex items-start gap-2 p-3.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-semibold animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Compliance Standard Widgets and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="security-middle-grid">
        {/* Compliance dial progress meter */}
        <div className="lg:col-span-1 p-5 rounded-lg border border-[#2D333B] bg-[#151921] flex flex-col justify-between text-center relative overflow-hidden">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Platform Integrity Score
            </h3>
            <p className="text-[10px] text-gray-500">CIS Foundations Average</p>
          </div>

          <div className="my-5 relative flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="#2D333B"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke={compliancePercentage > 80 ? '#10b981' : compliancePercentage > 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="11"
                fill="transparent"
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * compliancePercentage) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-extrabold font-mono text-white">
                {compliancePercentage}%
              </span>
              <span className="text-[9px] uppercase font-bold text-gray-500">PASSED</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[10px] uppercase font-mono">
            <div className="p-1 px-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <div className="font-bold">{passed}</div>
              <span>Pass</span>
            </div>
            <div className="p-1 px-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <div className="font-bold">{warnings}</div>
              <span>Warn</span>
            </div>
            <div className="p-1 px-1.5 rounded bg-red-500/10 text-rose-450 border border-red-500/20">
              <div className="font-bold">{failed}</div>
              <span>Fail</span>
            </div>
          </div>
        </div>

        {/* Detailed audit policy listings */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs Selector Standards and Severity */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded border border-[#2D333B] bg-[#151921] select-none text-xs font-semibold">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mr-1">Standard Framework:</span>
              {(['all', 'ISO 27001', 'SOC 2', 'GDPR', 'HIPAA'] as const).map(std => (
                <button
                  key={std}
                  onClick={() => setSelectedStandard(std)}
                  className={`px-3 py-1.5 rounded text-[11px] cursor-pointer transition-colors ${selectedStandard === std ? 'bg-[#2563EB] text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                  {std}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-1">Severity:</span>
              <select
                id="filter-sec-severity"
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value as any)}
                className="bg-[#0B0E14] border border-[#2D333B] rounded p-1.5 text-gray-200 outline-none uppercase font-bold text-[10px]"
              >
                <option value="all">levels: All</option>
                <option value="high">HIGH Only</option>
                <option value="medium">MEDIUM Only</option>
                <option value="low">LOW Only</option>
              </select>
            </div>
          </div>

          {/* Posture Checks list */}
          <div className="space-y-3" id="posture-checks-scroller">
            {filteredChecks.map(check => (
              <div
                key={check.id}
                id={`check-card-${check.id}`}
                className={`p-4 rounded border transition-colors hover:bg-[#151921]/40 ${
                  check.status === 'failed'
                    ? 'border-red-500/25 bg-red-950/5'
                    : check.status === 'warning'
                    ? 'border-amber-500/20 bg-amber-950/5'
                    : 'border-[#2D333B] bg-[#0B0E14]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    {/* Status icons picker */}
                    <div className="shrink-0 mt-0.5">
                      {check.status === 'passed' ? (
                        <ShieldCheck className="h-4.5 w-4.5 text-[#10B981]" />
                      ) : check.status === 'warning' ? (
                        <AlertTriangle className="h-4.5 w-4.5 text-[#F59E0B]" />
                      ) : (
                        <ShieldAlert className="h-4.5 w-4.5 text-[#EF4444]" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded uppercase font-bold text-[8.5px] ${
                          check.severity === 'high' ? 'bg-red-500/10 text-rose-400 border border-red-500/15' : check.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-550/15' : 'bg-slate-800 text-gray-400'
                        }`}>
                          {check.severity} priority
                        </span>
                        <span className="text-gray-500 font-mono">Resource: {check.resourceId}</span>
                        <span className="text-gray-500 uppercase font-bold">{check.provider}</span>
                      </div>

                      <h4 className={`text-xs font-bold leading-relaxed ${check.status === 'failed' ? 'text-rose-200' : 'text-white'}`}>
                        {check.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 max-w-2xl leading-relaxed">
                        {check.description}
                      </p>

                      {/* Standards tags mapping */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-1.5 border-t border-[#2D333B]/40">
                        <span className="text-[9px] text-gray-500 font-bold uppercase mr-1">Standards mapped:</span>
                        {check.complianceStandards.map(std => (
                          <span key={std} className="px-1.5 py-0.2 rounded bg-blue-500/5 text-blue-400 border border-blue-500/10 font-bold text-[9px] tracking-wide font-sans">
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-gray-500 ml-auto shrink-0 uppercase">
                    {check.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
