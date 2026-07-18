import React, { useState } from 'react';
import {
  Activity,
  Cloud,
  Terminal,
  AlertTriangle,
  DollarSign,
  Shield,
  FileText,
  Users,
  Zap,
  Globe,
  Clock,
  Sparkles,
  Info,
  Server,
  Database,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  RefreshCw,
  Bell,
  LogOut
} from 'lucide-react';

// Types and Mock Data
import {
  CloudAccount,
  CloudResource,
  CloudProvider,
  MonitoringLog,
  TraceFlow,
  AlertRule,
  ActiveIncident,
  CostMetric,
  RightsizingRecommendation,
  SecurityPostureCheck,
  AuditLogEntry,
  UserSession
} from './types';

import {
  initialAccounts,
  initialResources,
  initialLogs,
  initialTraces,
  initialAlertRules,
  initialIncidents,
  initialCostMetrics,
  initialRightsizingRecommendations,
  initialSecurityPostureChecks,
  initialAuditLogs,
  initialHistoryMetrics
} from './mockData';

// Components
import DashboardView from './components/DashboardView';
import ProviderConnector from './components/ProviderConnector';
import ObservabilityView from './components/ObservabilityView';
import AlertingView from './components/AlertingView';
import CostOptimizationView from './components/CostOptimizationView';
import SecurityComplianceView from './components/SecurityComplianceView';
import ReportGeneratorView from './components/ReportGeneratorView';
import UserManagementView from './components/UserManagementView';
import AuthView from './components/AuthView';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'observability' | 'alerts' | 'costs' | 'security' | 'reports' | 'users'>('dashboard');

  // Core State Engine
  const [accounts, setAccounts] = useState<CloudAccount[]>(initialAccounts);
  const [resources, setResources] = useState<CloudResource[]>(initialResources);
  const [logs, setLogs] = useState<MonitoringLog[]>(initialLogs);
  const [traces, setTraces] = useState<TraceFlow[]>(initialTraces);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(initialAlertRules);
  const [activeIncidents, setActiveIncidents] = useState<ActiveIncident[]>(initialIncidents);
  const [costMetrics, setCostMetrics] = useState<CostMetric[]>(initialCostMetrics);
  const [rightsizingRecommendations, setRightsizingRecommendations] = useState<RightsizingRecommendation[]>(initialRightsizingRecommendations);
  const [postureChecks, setPostureChecks] = useState<SecurityPostureCheck[]>(initialSecurityPostureChecks);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);

// Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('cloudobserve_session') !== null;
  });

  // User RBAC Simulator
  const [currentSession, setCurrentSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('cloudobserve_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      username: 'sre.master',
      email: 'sre.master@cloudobserve.corp',
      role: 'super_admin'
    };
  });

  // Action: Authenticate and boot session context
  const handleLoginSuccess = (session: UserSession) => {
    setCurrentSession(session);
    setIsAuthenticated(true);
    localStorage.setItem('cloudobserve_session', JSON.stringify(session));

    // Audit logs entry for login action
    const newAudit: AuditLogEntry = {
      id: `aud-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      username: session.username,
      role: session.role === 'super_admin'
        ? 'Super Admin'
        : session.role === 'cloud_admin'
        ? 'Cloud Admin'
        : session.role === 'operator'
        ? 'Operator'
        : 'Viewer',
      action: 'Authenticated Session Authorization',
      status: 'success',
      details: `User email: ${session.email}. Context: ${session.role.toUpperCase()}`,
      ipAddress: '10.240.16.82'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Action: Terminate session context
  const handleLogout = () => {
    triggerAuditLog(`Terminated Console Session`, `Logged out user: ${currentSession.username}`);
    setIsAuthenticated(false);
    localStorage.removeItem('cloudobserve_session');
  };

  // Action: Add audit logs record
  const triggerAuditLog = (action: string, details: string = '') => {
    const newAudit: AuditLogEntry = {
      id: `aud-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      username: currentSession.username,
      role: currentSession.role === 'super_admin'
        ? 'Super Admin'
        : currentSession.role === 'cloud_admin'
        ? 'Cloud Admin'
        : currentSession.role === 'operator'
        ? 'Operator'
        : 'Viewer',
      action,
      status: 'success',
      details: details || `Completed action under authentication context.`,
      ipAddress: '10.240.16.82'
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Action: Add Account integration
  const handleAddAccount = (account: CloudAccount) => {
    setAccounts(prev => [...prev, account]);

    // Simulate auto-generating 2 healthy resources for the added tenant account
    const newVM: CloudResource = {
      id: `${account.id}-vm-01`,
      name: `${account.name}-prod-microhost`,
      type: 'vm',
      provider: account.provider,
      region: account.provider === 'aws' ? 'us-east-1' : account.provider === 'gcp' ? 'us-central1' : 'eastus2',
      status: 'running',
      accountId: account.id,
      size: 'm5.large',
      ipAddress: '10.0.1.5',
      metrics: {
        cpu: 35,
        memory: 48,
        disk: 52,
        networkRate: 112
      }
    };

    const newDB: CloudResource = {
      id: `${account.id}-db-01`,
      name: `${account.name}-relational-sqlds`,
      type: 'database',
      provider: account.provider,
      region: account.provider === 'aws' ? 'us-east-1' : account.provider === 'gcp' ? 'us-central1' : 'eastus2',
      status: 'running',
      accountId: account.id,
      size: 'db.m5.large',
      ipAddress: '10.0.4.15',
      metrics: {
        cpu: 18,
        memory: 32,
        disk: 28,
        networkRate: 45
      }
    };

    setResources(prev => [...prev, newVM, newDB]);

    // Add cost allocation mock
    const newCost: CostMetric = {
      provider: account.provider,
      service: account.provider === 'aws' ? 'EC2 Cloud Compute' : account.provider === 'gcp' ? 'Compute Engine VM' : 'Azure Virtual Machines',
      amount: account.provider === 'aws' ? 4200 : account.provider === 'gcp' ? 3680 : 3910,
      region: account.provider === 'aws' ? 'us-east-1' : account.provider === 'gcp' ? 'us-central1' : 'eastus2',
      month: 'June',
      project: 'Web Portals',
      department: 'Engineering'
    };

    setCostMetrics(prev => [...prev, newCost]);

    triggerAuditLog(`Connected Cloud Provider Integration`, `Account Name: "${account.name}", Provider: "${account.provider.toUpperCase()}"`);
  };

  // Action: Remove account tenancy
  const handleRemoveAccount = (id: string) => {
    // Check permission safeguards
    if (currentSession.role === 'viewer') {
      alert('Insufficient credentials access: Viewer accounts are restricted from removing system connections.');
      return;
    }

    const matched = accounts.find(a => a.id === id);
    const friendlyName = matched ? matched.name : id;

    setAccounts(prev => prev.filter(acc => acc.id !== id));
    setResources(prev => prev.filter(r => !r.id.startsWith(id)));

    triggerAuditLog(`Purged Connected Cloud Integration`, `Account ID: "${id}" Title: "${friendlyName}"`);
  };

  // Action: Add alerting threshold rule
  const handleAddAlertRule = (rule: AlertRule) => {
    if (currentSession.role === 'viewer') {
      alert('Access Restricted. Viewer accounts cannot create metrics threshold rules.');
      return;
    }
    setAlertRules(prev => [rule, ...prev]);
  };

  // Action: Acknowledge alarm
  const handleAcknowledgeIncident = (incidentId: string) => {
    setActiveIncidents(prev =>
      prev.map(inc => (inc.id === incidentId ? { ...inc, status: 'acknowledged' as const } : inc))
    );
  };

  // Action: Resolve live incident
  const handleResolveIncident = (incidentId: string) => {
    setActiveIncidents(prev => prev.filter(inc => inc.id !== incidentId));

    // Restore affected mock resources metrics back to nominal limits!
    setResources(prev =>
      prev.map(res => {
        // Find which resource metrics might be compromised and smooth them
        if (res.status === 'unhealthy') {
          return {
            ...res,
            status: 'healthy' as const,
            metrics: { ...res.metrics, cpu: 28, memory: 45, latencyMs: 25 }
          };
        }
        return res;
      })
    );
  };

  // ACTION: SRE OUTAGE REACCELERATION SIMULATOR COCKPIT
  const handleTriggerMockOutage = (metricType: 'cpu' | 'database') => {
    triggerAuditLog(`Dispatched SRE Chaos Outage Simulation`, `Target metric: ${metricType.toUpperCase()}`);

    if (metricType === 'cpu') {
      // 1. Mark target VM (AWS prod checkout service) as unhealthy
      setResources(prev =>
        prev.map(res => {
          if (res.id === 'res-aws-1') { // aws-prod-checkout-microservice
            return {
              ...res,
              status: 'critical' as const,
              metrics: { ...res.metrics, cpu: 98.4 }
            };
          }
          return res;
        })
      );

      // 2. Append critical active incident warning to state
      const mockCpuAlert: ActiveIncident = {
        id: `inc-${Math.random().toString(36).substring(2, 6)}`,
        ruleId: 'rule-01',
        name: 'Critical VM CPU Overload (Threshold Breach)',
        severity: 'critical',
        provider: 'aws',
        resourceId: 'res-aws-1',
        resourceName: 'aws-prod-checkout-microservice',
        metricName: 'CPU Utilization Rate',
        currentValue: 98.4,
        thresholdValue: 85,
        status: 'active',
        timestamp: new Date().toISOString()
      };

      setActiveIncidents(prev => [mockCpuAlert, ...prev]);

      // 3. Spool relevant failure log into aggregated ingestion feed!
      const mockErrLog: MonitoringLog = {
        id: `log-sim-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        level: 'error',
        provider: 'aws',
        service: 'checkout-service',
        component: 'v8-garbage-collector',
        resourceId: 'res-aws-1',
        message: 'v8 Heap allocation memory limit exhausted. Thread deadlock block in pool, checkout route stalling with HTTP 504 Gateway Timeout.',
        payload: JSON.stringify({
          errorCode: 'ERR_V8_HEAP_EXHAUSTED',
          max_capacity_bytes: 4294967296,
          concurrent_connections: 11200,
          region_deployment: 'us-east-1'
        })
      };

      setLogs(prev => [mockErrLog, ...prev]);

    } else {
      // Database Latency Starvation
      setResources(prev =>
        prev.map(res => {
          if (res.id === 'res-gcp-2') { // gcp-cloud-spanner-production
            return {
              ...res,
              status: 'critical' as const,
              metrics: { ...res.metrics, cpu: 89.2 }
            };
          }
          return res;
        })
      );

      const mockDbAlert: ActiveIncident = {
        id: `inc-${Math.random().toString(36).substring(2, 6)}`,
        ruleId: 'rule-02',
        name: 'PostgreSQL Connection Starvation & Pool Saturation',
        severity: 'critical',
        provider: 'gcp',
        resourceId: 'res-gcp-2',
        resourceName: 'gcp-cloud-spanner-production',
        metricName: 'DB Roundtrip Latency Spike',
        currentValue: 2450,
        thresholdValue: 500,
        status: 'active',
        timestamp: new Date().toISOString()
      };

      setActiveIncidents(prev => [mockDbAlert, ...prev]);

      const mockDbLog: MonitoringLog = {
        id: `log-sim-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        level: 'error',
        provider: 'gcp',
        service: 'spanner-core',
        component: 'schema-deadlock-listener',
        resourceId: 'res-gcp-2',
        message: 'FATAL: database connections limit breached maximum allowed pools (Max: 400). Lock starvation detected on metadata indexes.',
        payload: JSON.stringify({
          active_sessions: 402,
          blocked_queries_count: 85,
          lock_timeout_window_ms: 10000,
          system_cpu: '89.2%'
        })
      };

      setLogs(prev => [mockDbLog, ...prev]);
    }
  };

  // Change RBAC role
  const handleChangeRole = (role: UserSession['role']) => {
    setCurrentSession(prev => {
      const updated = { ...prev, role };
      localStorage.setItem('cloudobserve_session', JSON.stringify(updated));
      return updated;
    });
    triggerAuditLog(`Switched Authorization RBAC Session Role`, `New Role Context: ${role.toUpperCase()}`);
  };

  if (!isAuthenticated) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E0E0E0] flex flex-col font-sans" id="applet-mainframe">
      {/* Top Navigation banner header styling */}
      <header className="border-b border-[#2D333B] bg-[#151921] h-16 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">
                CloudObserve <span className="text-blue-500">PRO</span>
              </span>
              <span className="text-[9px] font-bold text-sky-450 bg-blue-500/10 px-1.5 py-0.2 rounded font-mono uppercase tracking-widest border border-blue-500/15">
                AI CO-PILOT
              </span>
            </div>
          </div>
        </div>

        {/* Global telemetry summary badges */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          {/* Incidents Indicator */}
          {activeIncidents.length > 0 ? (
            <div
              id="top-incidents-badge"
              onClick={() => setActiveTab('alerts')}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-950/40 border border-red-500/30 text-red-400 rounded-full animate-pulse cursor-pointer select-none"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{activeIncidents.length} OUTAGES ACTIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/15 text-emerald-450 rounded-full select-none text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450" />
              <span>SLA SAFETY SECURE</span>
            </div>
          )}

          {/* Quick Simulates triggers buttons */}
          <div className="flex items-center gap-1.5 bg-[#0B0E14] p-1 rounded border border-[#2D333B]">
            <span className="text-[10px] text-gray-500 font-mono pl-1.5 font-bold uppercase">Chaos Inject:</span>
            <button
              id="btn-chaos-checkout"
              onClick={() => handleTriggerMockOutage('cpu')}
              className="px-2 py-1 bg-red-950/40 hover:bg-red-950/80 text-red-400 text-[10px] rounded border border-red-500/20 cursor-pointer font-bold transition-all"
            >
              Exhaust CPU
            </button>
            <button
              id="btn-chaos-spanner"
              onClick={() => handleTriggerMockOutage('database')}
              className="px-2 py-1 bg-rose-950/40 hover:bg-rose-950/80 text-rose-450 text-[10px] rounded border border-rose-500/20 cursor-pointer font-bold transition-all"
            >
              Saturate Spanner
            </button>
          </div>

          {/* User badge and Logout button */}
          <div className="flex items-center gap-2">
            <div
              onClick={() => setActiveTab('users')}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0B0E14] border border-[#2D333B] hover:bg-[#1C212B] text-slate-200 rounded cursor-pointer select-none font-mono text-[10.5px]"
              title="View identity status"
            >
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span className="uppercase font-bold">{currentSession.role.replace('_', ' ')}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-950/25 hover:bg-rose-950/50 text-rose-450 border border-rose-500/20 hover:border-rose-500/35 rounded cursor-pointer select-none font-mono text-[10.5px] font-bold flex items-center gap-1.5 transition-all"
              title="Sign out of console"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">SIGN OUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container workspace */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Sidebar Left Navigation navigation drawer panel */}
        <nav className="w-full md:w-64 border-r border-[#2D333B] bg-[#151921] p-4 space-y-1 shrink-0 md:sticky md:top-16 md:h-[calc(100vh-64px)] overflow-y-auto" id="sidebar-nav">
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
            Monitoring
          </div>

          {([
            { id: 'dashboard', name: 'Observability Hub', icon: Activity },
            { id: 'accounts', name: 'Provider Tenants', icon: Cloud },
            { id: 'observability', name: 'Logs & Distributed Traces', icon: Terminal },
            { id: 'alerts', name: 'Alarms & Pagers', icon: Bell },
            { id: 'costs', name: 'Cost Optimization (FinOps)', icon: DollarSign },
            { id: 'security', name: 'Security Posture Shield', icon: Shield },
            { id: 'reports', name: 'Compiled Reports Exporter', icon: FileText },
            { id: 'users', name: 'Directory & RBAC Policies', icon: Users }
          ] as const).map(tabNode => {
            const Icon = tabNode.icon;
            const isTabActive = activeTab === tabNode.id;

            return (
              <button
                key={tabNode.id}
                id={`btn-nav-tab-${tabNode.id}`}
                onClick={() => setActiveTab(tabNode.id)}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded transition-colors text-xs font-semibold select-none cursor-pointer ${
                  isTabActive
                    ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-600'
                    : 'text-gray-400 hover:bg-[#1C212B] hover:text-[#E0E0E0]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isTabActive ? 'text-blue-400' : 'text-gray-500'}`} />
                  <span>{tabNode.name}</span>
                </div>

                {/* Badge count indicators inside sidebar items */}
                {tabNode.id === 'alerts' && activeIncidents.length > 0 && (
                  <span className="shrink-0 bg-red-900/50 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {activeIncidents.length}
                  </span>
                )}
                {tabNode.id === 'accounts' && (
                  <span className="shrink-0 bg-[#0B0E14] text-gray-400 font-mono px-1.5 py-0.2 rounded border border-[#2D333B] text-[10px]">
                    {accounts.length}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 border-t border-[#2D333B] mt-6 select-none">
            <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg text-[11px] leading-relaxed font-sans text-gray-450">
              <span className="text-[10px] font-bold text-blue-450 uppercase tracking-wider block mb-1">CoPilot Status</span>
              <p className="text-gray-400">Connected server-side with Gemini API key to deliver instant outage recovery playbooks.</p>
            </div>
          </div>
        </nav>

        {/* Content Area viewport */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0B0E14]" id="applet-viewport">
          {activeTab === 'dashboard' && (
            <DashboardView
              accounts={accounts}
              resources={resources}
              historyMetrics={initialHistoryMetrics}
              onTriggerAlert={handleTriggerMockOutage}
              activeIncidentsCount={activeIncidents.length}
            />
          )}

          {activeTab === 'accounts' && (
            <ProviderConnector
              accounts={accounts}
              onAddAccount={handleAddAccount}
              onDeleteAccount={handleRemoveAccount}
              onTriggerAuditLog={triggerAuditLog}
            />
          )}

          {activeTab === 'observability' && (
            <ObservabilityView
              logs={logs}
              traces={traces}
              onTriggerAuditLog={triggerAuditLog}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertingView
              alertRules={alertRules}
              activeIncidents={activeIncidents}
              onAddAlertRule={handleAddAlertRule}
              onResolveIncident={handleResolveIncident}
              onAcknowledgeIncident={handleAcknowledgeIncident}
              onTriggerAlert={handleTriggerMockOutage}
              onTriggerAuditLog={triggerAuditLog}
            />
          )}

          {activeTab === 'costs' && (
            <CostOptimizationView
              costMetrics={costMetrics}
              rightsizingRecommendations={rightsizingRecommendations}
              onTriggerAuditLog={triggerAuditLog}
            />
          )}

          {activeTab === 'security' && (
            <SecurityComplianceView
              postureChecks={postureChecks}
              onTriggerAuditLog={triggerAuditLog}
            />
          )}

          {activeTab === 'reports' && (
            <ReportGeneratorView
              accounts={accounts}
              resources={resources}
              activeIncidents={activeIncidents}
              costMetrics={costMetrics}
              onTriggerAuditLog={triggerAuditLog}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementView
              currentSession={currentSession}
              onChangeRole={handleChangeRole}
              auditLogs={auditLogs}
            />
          )}
        </main>
      </div>

      {/* Footer footer information credit line */}
      <footer className="border-t border-[#2D333B] bg-[#151921] p-4 text-center text-[10.5px] text-gray-500 font-mono flex items-center justify-between px-6">
        <span>CloudObserve PRO Console</span>
        <span className="flex items-center gap-1 text-gray-400">
          <Globe className="h-3 w-3 text-blue-500" /> multi-cloud-node-3 &bull; SLA 99.99%
        </span>
      </footer>
    </div>
  );
}
