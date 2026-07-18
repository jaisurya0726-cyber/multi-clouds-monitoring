import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Users,
  Download,
  Eye,
  Settings,
  HelpCircle,
  Printer,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { CloudAccount, CloudResource, ActiveIncident, CostMetric } from '../types';

interface ReportGeneratorProps {
  accounts: CloudAccount[];
  resources: CloudResource[];
  activeIncidents: ActiveIncident[];
  costMetrics: CostMetric[];
  onTriggerAuditLog: (action: string) => void;
}

export default function ReportGeneratorView({
  accounts,
  resources,
  activeIncidents,
  costMetrics,
  onTriggerAuditLog
}: ReportGeneratorProps) {
  const [templateType, setTemplateType] = useState<'billing' | 'reliability' | 'security'>('billing');
  const [reportPeriod, setReportPeriod] = useState<'30days' | 'current_cycle' | 'quarter'>('current_cycle');

  // Preview compile flags
  const [compiledReport, setCompiledReport] = useState<boolean>(false);
  const [isCompiling, setIsCompiling] = useState(false);

  const handleCompileReport = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setCompiledReport(true);
      onTriggerAuditLog(`Compiled PDF Compliance Executive Report: ${templateType.toUpperCase()} - period ${reportPeriod}`);
    }, 1000);
  };

  const handleNativePrint = () => {
    onTriggerAuditLog(`Invoked native printing subsystem PDF exporter.`);
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="report-generator-view">
      {/* Settings layout bar */}
      <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-450" /> Executive Analytics & Report Compiler
          </h2>
          <p className="text-[11px] text-gray-450 mt-1">
            Publish fully structured compliance document audits, cost forecasts, and cluster capacity metrics.
          </p>
        </div>

        {/* Configuration selectors row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0B0E14] p-4 rounded border border-[#2D333B] text-xs">
          {/* Template select */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
              Report Template Schema
            </label>
            <select
              id="report-select-template"
              value={templateType}
              onChange={e => {
                setTemplateType(e.target.value as any);
                setCompiledReport(false);
              }}
              className="w-full bg-[#151921] border border-[#2D333B] rounded p-2 text-gray-200 outline-none"
            >
              <option value="billing">Cloud FinOps Budget & Cost Forecast Summary</option>
              <option value="reliability">SRE Observability & Metric SLA Performance</option>
              <option value="security">GDPR/CIS Cloud Security Posture Audit</option>
            </select>
          </div>

          {/* Date Picker select */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
              Target Billing Window
            </label>
            <select
              id="report-select-period"
              value={reportPeriod}
              onChange={e => {
                setReportPeriod(e.target.value as any);
                setCompiledReport(false);
              }}
              className="w-full bg-[#151921] border border-[#2D333B] rounded p-2 text-gray-200 outline-none"
            >
              <option value="current_cycle">Current active billing cycle (Trace: June)</option>
              <option value="30days">Historical Trailing 30-Day Windows</option>
              <option value="quarter">Q2 Enterprise Fiscal Consolidated</option>
            </select>
          </div>

          {/* Trigger button */}
          <div className="flex items-end">
            <button
              id="btn-trigger-compile"
              onClick={handleCompileReport}
              disabled={isCompiling}
              className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold p-2.5 rounded text-xs transition-colors cursor-pointer border-none font-sans"
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Compiling Report Assets ...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Compile Executive Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Render compiled report layout */}
      {compiledReport && (
        <div className="space-y-4 animate-fade-in" id="compiled-report-paper-container">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between p-3.5 bg-[#151921] border border-[#2D333B] rounded text-xs">
            <span className="text-gray-300 font-sans flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-450" /> Compiled PDF compliance asset ready for print
            </span>

            <div className="flex items-center gap-2.5 cursor-pointer">
              <button
                id="btn-browser-print"
                onClick={handleNativePrint}
                className="flex items-center gap-1.5 bg-[#2D333B] hover:bg-[#2D333B]/80 text-[#E0E0E0] border border-[#2D333B]/50 px-3.5 py-2 rounded text-xs transition-colors cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save PDF File
              </button>
            </div>
          </div>

          {/* Formal Audit Document Style Sheet Paper */}
          <div className="p-8 rounded border border-[#2D333B] bg-[#0B0E14] text-gray-300 font-sans leading-relaxed text-xs shadow-2xl relative select-text" id="report-print-paper">
            {/* Header branding logo */}
            <div className="flex justify-between items-start border-b border-[#2D333B] pb-5 mb-5">
              <div className="space-y-1">
                <h4 className="text-[9px] font-mono tracking-widest text-gray-500 uppercase font-bold">Multi-Cloud Monitoring Platform</h4>
                <h2 className="text-base font-bold tracking-tight text-white uppercase">EXECUTIVE STATUS AUDIT REPORT</h2>
              </div>
              <div className="text-right text-[10px] text-gray-500 font-mono space-y-0.5">
                <div>Published: {new Date().toLocaleDateString()}</div>
                <div>Hash: MD5-019FB-{Math.floor(Math.random()*90000+10000)}</div>
                <div className="text-blue-400 uppercase font-bold">STATUS APPROVED</div>
              </div>
            </div>

            {/* Content template specific billing */}
            {templateType === 'billing' && (
              <div className="space-y-6 text-gray-300">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">1. Consolidated FinOps Invoices & Projections</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    This document summarizes consolidated cloud provider invoicing aggregates gathered from connected IAM billing API keys. Spends are grouped by target cost-center departments.
                  </p>
                </div>

                {/* Micro metrics counts values */}
                <div className="grid grid-cols-3 gap-4 border-y border-[#2D333B] py-4 font-sans text-xs">
                  <div>
                    <span className="text-gray-500 uppercase text-[9px] font-bold block">Consolidated Spends</span>
                    <div className="text-white font-mono font-bold text-base mt-1">${costMetrics.reduce((a,c)=>a+c.amount,0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase text-[9px] font-bold block">Connected tenants</span>
                    <div className="text-white font-mono font-bold text-base mt-1">{accounts.length} active platforms</div>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase text-[9px] font-bold block">Run-rate variance</span>
                    <div className="text-emerald-400 font-mono font-bold text-base mt-1">- 4.8% (Optimized)</div>
                  </div>
                </div>

                {/* Cost table list */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-100 uppercase">Provider Billing Itemizations</h4>
                  <table className="w-full text-left font-sans text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#2D333B] text-gray-500 font-bold uppercase text-[9px]">
                        <th className="py-2">Cloud Provider</th>
                        <th className="py-2">Cost Center Item</th>
                        <th className="py-2">Billing Region</th>
                        <th className="py-2 text-right">Invoiced Sum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D333B] border-b border-[#2D333B] text-gray-400">
                      {costMetrics.map((m, i) => (
                        <tr key={i} className="hover:bg-[#151921]/20">
                          <td className="py-2 font-bold uppercase text-gray-200">{m.provider}</td>
                          <td className="py-2">{m.service}</td>
                          <td className="py-2 font-mono uppercase">{m.region}</td>
                          <td className="py-2 text-right font-mono text-white">${m.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reliability SLA report */}
            {templateType === 'reliability' && (
              <div className="space-y-6 text-gray-300">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">1. Service Reliability & SLA Performance Audit</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Executive overview of infrastructure availability margins, hardware load factors, and active reliability incidents reported on AWS EKS and GCP GKE grids.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-[#2D333B] py-4 font-sans text-xs">
                  <div>
                    <span className="text-gray-500 uppercase text-[9px] font-bold block">Aggregated VM CPU Load</span>
                    <div className="text-white font-mono font-bold text-base mt-1">48.2% avg</div>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase text-[9px] font-bold block">Average SLA uptime</span>
                    <div className="text-emerald-400 font-mono font-bold text-base mt-1">99.982% status</div>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase text-[9px] font-bold block">Active alarms pending</span>
                    <div className={`font-mono font-bold text-base mt-1 ${activeIncidents.length > 0 ? 'text-red-400 font-bold' : 'text-white'}`}>
                      {activeIncidents.length} active incidents
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-100 uppercase">Active Reliability Outliers</h4>
                  <table className="w-full text-left font-sans text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#2D333B] text-gray-500 font-semibold uppercase text-[9px]">
                        <th className="py-2">Incident Name</th>
                        <th className="py-2">Failure Node</th>
                        <th className="py-2">Outage severity</th>
                        <th className="py-2 text-right">Trigger Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D333B] border-b border-[#2D333B] text-gray-400">
                      {activeIncidents.map((inc, i) => (
                        <tr key={i} className="hover:bg-[#151921]/20">
                          <td className="py-2 font-bold text-rose-455">{inc.name}</td>
                          <td className="py-2">{inc.resourceName}</td>
                          <td className="py-2 uppercase font-mono text-rose-450 font-bold">{inc.severity}</td>
                          <td className="py-2 text-right font-mono">{new Date(inc.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                      {activeIncidents.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-500 italic">No unresolved structural performance SLA incidents recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Security and GDPR audits */}
            {templateType === 'security' && (
              <div className="space-y-6 text-gray-300">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">1. Policy Audits & GDPR Compliance Statement</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    This security posture compliance memorandum verifies cloud IAM network access structures against SOC 2 and GDPR Article 32 encryption safety baselines.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-[#2D333B] py-4 font-sans text-xs">
                  <div>
                    <span className="text-gray-500 uppercase text-[9px] font-bold block">ISO 27001 Status</span>
                    <div className="text-blue-400 font-mono font-bold text-base mt-1">COMPLIANT (88%)</div>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase text-[9px] font-bold block">GDPR Encryption level</span>
                    <div className="text-emerald-450 font-mono font-bold text-base mt-1">TLS 1.2 Mandatory</div>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase text-[9px] font-bold block">Critical Infractions</span>
                    <div className="text-rose-400 font-mono font-bold text-base mt-1">2 Policy Warnings</div>
                  </div>
                </div>

                <div className="p-4 bg-[#151921] font-sans text-[11px] leading-relaxed border border-[#2D333B] rounded">
                  <h4 className="font-bold text-slate-105 uppercase text-[10px] mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Administrative compliance Recommendations
                  </h4>
                  <ul className="list-disc pl-4 space-y-2 text-gray-400">
                    <li>SSH network port 22 open directly to global addressing range 0.0.0.0/0 must be restricted to enterprise VPN gateways instantly.</li>
                    <li>Ensure CosmosDB storage handles minimum TLS 1.2 secure connections to avoid data flow interceptions logs.</li>
                    <li>Audit GCP analytics storage bucket manipulation actions configurations immediately.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Signatory line */}
            <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-[#2D333B] font-sans text-[10px] text-gray-500">
              <div>
                <span className="font-bold block uppercase text-[8px] text-gray-500">Certified SRE Auditor</span>
                <div className="border-b border-[#2D333B] w-40 h-8 mt-1" />
                <div className="mt-2 font-mono uppercase text-gray-550">CloudObserve Security Subsystem</div>
              </div>

              <div className="text-right">
                <span className="font-bold block uppercase text-[8px] text-gray-505">Verification Stamp</span>
                <div className="mt-2 text-[#2563EB] font-black tracking-widest text-xs uppercase underline">STS CERTIFIED INTEGRITY</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
