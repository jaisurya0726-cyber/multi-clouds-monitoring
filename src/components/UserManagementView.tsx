import React from 'react';
import {
  Users,
  Settings,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Shield,
  Eye,
  Activity,
  UserCheck
} from 'lucide-react';
import { AuditLogEntry, UserSession } from '../types';

interface UserManagementProps {
  currentSession: UserSession;
  onChangeRole: (role: UserSession['role']) => void;
  auditLogs: AuditLogEntry[];
}

export default function UserManagementView({
  currentSession,
  onChangeRole,
  auditLogs
}: UserManagementProps) {
  // Define features mappings per RBAC roles
  const rbacPermissions = {
    viewer: {
      title: 'Viewer Permissions',
      desc: 'Read-only access across cloud resources and metrics panels. Cannot modify thresholds or drop credentials.',
      allowed: ['Read metrics charts', 'View connected cloud platforms accounts details', 'Inspect security compliance checklists', 'View active alerts log'],
      denied: ['Add or remove cloud integration credentials', 'Create or modify thresholds alerting rules', 'Resolve active SRE incidents', 'Re-trigger security posture policy sweeps']
    },
    operator: {
      title: 'Operations Operator Permissions',
      desc: 'Active reliability incident managers. Can modify metrics rule parameters and acknowledge/resolve active outages.',
      allowed: ['Read metrics charts', 'View connected cloud accounts details', 'Acknowledge & resolve active outage incidents', 'Synthesize custom metrics thresholds alarm rules', 'Review trace topologies'],
      denied: ['Connect new AWS/GCP credential integrations', 'Configure Staff security configurations', 'Delete connected cloud account tenancies']
    },
    cloud_admin: {
      title: 'Cloud Master Administrator Permissions',
      desc: 'Full read/write cloud integration managers. Handles IAM role and API authorization trust connections.',
      allowed: ['Read metrics charts', 'Manage connected AWS / Azure / GCP accounts integrations', 'Register credentials keyfiles', 'Mute/unmute active alert rules thresholds', 'Initiate GDPR security scans'],
      denied: ['Modify system global SSO directories', 'Purge system transaction trace audit trails']
    },
    super_admin: {
      title: 'Super Executive Administrator Permissions',
      desc: 'Complete unfettered privileges. Standard root authorization permissions across all full-stack panels.',
      allowed: ['Read metrics charts', 'Manage cloud tenancy integrations', 'Modify metric alert rules', 'Resolve incidents & run SRE playbooks', 'Audit GDPR scan outcomes', 'Review full staff audit records', 'Configure enterprise RBAC directories'],
      denied: []
    }
  };

  const activePerms = rbacPermissions[currentSession.role];

  return (
    <div className="space-y-6 animate-fade-in" id="user-rbac-management-view">
      {/* Overview RBAC Switcher */}
      <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921]">
        <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2" id="rbac-title-head">
          <Users className="h-4 w-4 text-blue-500" /> Identity Directory & RBAC Directory
        </h2>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Simulate Role-Based Access Control structures by switching active staff credentials profiles.
        </p>

        {/* Roles Tabbing Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0B0E14] p-1.5 rounded border border-[#2D333B] mt-4 select-none">
          {([
            { id: 'viewer', name: 'Operator Viewer', title: 'Viewer' },
            { id: 'operator', name: 'SRE Operator', title: 'Operator' },
            { id: 'cloud_admin', name: 'Cloud Admin', title: 'Admin' },
            { id: 'super_admin', name: 'Super Admin', title: 'Root' }
          ] as const).map(roleNode => (
            <button
              key={roleNode.id}
              onClick={() => onChangeRole(roleNode.id)}
              type="button"
              id={`btn-rbac-role-${roleNode.id}`}
              className={`py-3 px-1 rounded flex flex-col items-center justify-center transition-colors cursor-pointer ${
                currentSession.role === roleNode.id
                  ? 'bg-[#2D333B] text-blue-400 border border-blue-500/20 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shield className={`h-4 w-4 mb-1.5 ${currentSession.role === roleNode.id ? 'text-blue-400' : 'text-gray-500'}`} />
              <span className="text-xs font-semibold">{roleNode.name}</span>
              <span className="text-[9px] font-medium text-gray-500 font-mono">({roleNode.title})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="rbac-details-grid">
        {/* Active permissions manifest card */}
        <div className="lg:col-span-1 p-5 rounded-lg border border-[#2D333B] bg-[#151921] flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-450 flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5" /> Effective Rights Matrix
            </span>
            <h3 className="text-sm font-bold text-white mt-1.5">{activePerms.title}</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              {activePerms.desc}
            </p>
          </div>

          <div className="space-y-4">
            {/* Allowed rules Checklist */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Permitted Permissions</span>
              <div className="space-y-1.5 text-[11px] text-gray-300">
                {activePerms.allowed.map((perm, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Denied details */}
            {activePerms.denied.length > 0 && (
              <div className="space-y-2 pt-3.5 border-t border-[#2D333B]">
                <span className="text-[9px] font-bold text-rose-450 uppercase tracking-widest block">Restricted Capabilities</span>
                <div className="space-y-1.5 text-[11px] text-gray-400">
                  {activePerms.denied.map((perm, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="line-through text-gray-500">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Staff audit logs trace timeline */}
        <div className="lg:col-span-2 p-5 rounded-lg border border-[#2D333B] bg-[#151921]" id="audit-trail-segment">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-gray-400" /> Platform Audit Trail Logs & Records ({auditLogs.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10.5px] border-collapse" id="tbl-audit">
              <thead>
                <tr className="border-b border-[#2D333B] text-gray-500 font-bold uppercase text-[9px] tracking-wider pb-2">
                  <th className="py-2.5 px-1">Timestamp</th>
                  <th className="py-2.5 px-1">Staff Member</th>
                  <th className="py-2.5 px-1">Role Type</th>
                  <th className="py-2.5 px-1">Action Description</th>
                  <th className="py-2.5 px-1 text-right">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D333B]/50 text-gray-300">
                {auditLogs.map(aud => (
                  <tr key={aud.id} className="hover:bg-[#1C212B] transition-colors" id={`row-aud-${aud.id}`}>
                    <td className="py-2.5 px-1 font-sans text-gray-500 text-[10px]">
                      {new Date(aud.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-1 font-semibold text-slate-200">
                      {aud.username.split('@')[0]}
                    </td>
                    <td className="py-2.5 px-1 uppercase text-[9px]">
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[8px] ${
                        aud.role.includes('Super')
                          ? 'bg-rose-500/10 text-rose-450'
                          : aud.role.includes('Admin')
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {aud.role.replace('Super ', 'Root-')}
                      </span>
                    </td>
                    <td className="py-2.5 px-1 font-sans text-slate-200 font-medium">
                      {aud.action}
                      <span className="text-[9.5px] text-gray-500 block max-w-sm truncate animate-fade-in" title={aud.details}>
                        {aud.details}
                      </span>
                    </td>
                    <td className="py-2.5 px-1 text-right font-mono text-gray-500">
                      {aud.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
