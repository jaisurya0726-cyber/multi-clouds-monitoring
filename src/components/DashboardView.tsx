import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import {
  Activity,
  Cpu,
  Database,
  Layers,
  Network,
  RefreshCw,
  Server,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { CloudAccount, CloudResource, MetricDataPoint } from '../types';

interface DashboardViewProps {
  accounts: CloudAccount[];
  resources: CloudResource[];
  historyMetrics: Record<string, MetricDataPoint[]>;
  onTriggerAlert: (ruleType: string) => void;
  activeIncidentsCount: number;
}

export default function DashboardView({
  accounts,
  resources,
  historyMetrics,
  onTriggerAlert,
  activeIncidentsCount
}: DashboardViewProps) {
  const [selectedProvider, setSelectedProvider] = useState<'all' | 'aws' | 'gcp' | 'azure'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [chartMetric, setChartMetric] = useState<'cpu' | 'memory' | 'network' | 'dbLatency'>('cpu');

  // Local effect for random fluctuation simulation representing real-time telemetry
  const [simulatedOffset, setSimulatedOffset] = useState<number>(0);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setSimulatedOffset(prev => prev + (Math.random() * 4 - 2));
      setLastRefreshed(new Date().toLocaleTimeString());
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter accounts based on provider selection
  const activeAccounts = accounts.filter(
    acc => selectedProvider === 'all' || acc.provider === selectedProvider
  );

  // Filter resources based on provider selection
  const activeResources = resources.filter(
    res => selectedProvider === 'all' || res.provider === selectedProvider
  );

  // Derive resource status aggregates
  const totalResources = activeResources.length;
  const runningResources = activeResources.filter(r => r.status === 'running').length;
  const criticalResources = activeResources.filter(r => r.status === 'critical').length;
  const warningResources = activeResources.filter(r => r.status === 'warning').length;

  // Derive dynamic average metrics based on active items + simulated oscillation logic
  const getAverageMetric = (key: 'cpu' | 'memory' | 'disk') => {
    const list = activeResources.filter(r => r.status !== 'terminated');
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + curr.metrics[key], 0);
    const avg = sum / list.length + (simulatedOffset * 0.1);
    return Math.max(5, Math.min(98, Math.round(avg)));
  };

  const avgCpu = getAverageMetric('cpu');
  const avgMemory = getAverageMetric('memory');
  const avgDisk = getAverageMetric('disk');

  // Compute database specific status
  const sqlConnections = activeResources
    .filter(r => r.type === 'database')
    .reduce((acc, curr) => acc + (curr.metrics.dbConnections || 0), 0);

  // Compute active pods/nodes on k8s
  const totalK8sNodes = activeResources
    .filter(r => r.type === 'k8s_cluster')
    .reduce((acc, curr) => acc + (curr.metrics.k8sNodesTotal || 0), 0);
  const onlineK8sNodes = activeResources
    .filter(r => r.type === 'k8s_cluster')
    .reduce((acc, curr) => acc + (curr.metrics.k8sNodesOnline || 0), 0);

  // Get current historical line dataset adjusted with noise
  const rawHistory = historyMetrics[selectedProvider] || historyMetrics.all;
  const adjustedHistory = rawHistory.map((pt, index) => {
    // Add extra simulation drift on the final data point based on trigger
    const noiseMultiplier = index === rawHistory.length - 1 ? simulatedOffset : (Math.sin(index) * 2);
    return {
      ...pt,
      cpu: Math.max(10, Math.min(99, Math.round(pt.cpu + noiseMultiplier))),
      memory: Math.max(20, Math.min(98, Math.round(pt.memory + noiseMultiplier * 0.5))),
      networkIn: Math.round(pt.networkIn + noiseMultiplier * 2.5),
      networkOut: Math.round(pt.networkOut + noiseMultiplier * 3.1),
      dbLatency: Math.max(2, Math.round(pt.dbLatency + noiseMultiplier * 0.2))
    };
  });

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-view-panel">
      {/* Selector & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg border border-[#2D333B] bg-[#151921]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2" id="dash-title">
            <Activity className="h-4 w-4 text-blue-500 animate-pulse" /> Centralized Operations Dashboard
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Real-time telemetry aggregate across connected multi-cloud providers &bull; UTC Stethoscope
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Provider Filtering Tabs */}
          <div className="flex items-center rounded bg-[#0B0E14] p-1 border border-[#2D333B]">
            {(['all', 'aws', 'gcp', 'azure'] as const).map(provider => (
              <button
                key={provider}
                id={`btn-provider-${provider}`}
                onClick={() => setSelectedProvider(provider)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors uppercase ${
                  selectedProvider === provider
                    ? 'bg-[#2D333B] text-blue-400 font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>

          <button
            id="btn-toggle-refresh"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
              autoRefresh
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                : 'border-[#2D333B] bg-[#0B0E14] text-gray-400'
            }`}
          >
            <RefreshCw className={`h-3 w-3 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Live Streaming' : 'Paused'}
          </button>

          <span className="text-[10px] font-mono text-gray-500 bg-[#0B0E14] px-2..5 py-1.5 rounded border border-[#2D333B]">
            REFRESH: {lastRefreshed}
          </span>
        </div>
      </div>

      {/* Metric Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5" id="kpi-tiles-grid">
        {/* Core CPU CPU */}
        <div className="bg-[#151921] border border-[#2D333B] rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Cpu className="h-16 w-16 text-slate-400" />
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
              <Cpu className="h-3 w-3 text-blue-500" /> Average CPU
            </div>
            <div className="text-2xl font-mono text-white mt-1.5 font-bold">{avgCpu}%</div>
          </div>
          <div className="mt-3">
            <div className="text-[10px] text-blue-400 font-mono mb-1">↑ ±2% dynamic variance</div>
            <div className="w-full bg-[#0B0E14] h-1 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${avgCpu}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Global Memory sat */}
        <div className="bg-[#151921] border border-[#2D333B] rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Layers className="h-16 w-16 text-slate-400" />
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
              <Layers className="h-3 w-3 text-sky-400" /> Memory Saturation
            </div>
            <div className="text-2xl font-mono text-white mt-1.5 font-bold">{avgMemory}%</div>
          </div>
          <div className="mt-3">
            <div className="text-[10px] text-sky-400 font-mono mb-1">Active swap allocation</div>
            <div className="w-full bg-[#0B0E14] h-1 rounded-full overflow-hidden">
              <div
                className="bg-sky-450 h-full rounded-full transition-all duration-500"
                style={{ width: `${avgMemory}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Storage disk util */}
        <div className="bg-[#151921] border border-[#2D333B] rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Server className="h-16 w-16 text-slate-400" />
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
              <Server className="h-3 w-3 text-green-400" /> Active Nodes
            </div>
            <div className="text-2xl font-mono text-white mt-1.5 font-bold">{avgDisk}%</div>
          </div>
          <div className="mt-3">
            <div className="text-[10px] text-green-400 font-mono mb-1">IOPS health nominal</div>
            <div className="w-full bg-[#0B0E14] h-1 rounded-full overflow-hidden">
              <div
                className="bg-green-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${avgDisk}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Global Outages or Warning Indicator */}
        <div className={`border rounded-lg p-5 flex flex-col justify-between relative overflow-hidden transition-all ${
          activeIncidentsCount > 0
            ? 'border-red-500/30 bg-[#251216]'
            : 'border-[#2D333B] bg-[#151921]'
        }`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <AlertTriangle className="h-16 w-16 text-slate-400" />
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" /> Alerts (Critical)
            </div>
            <div className={`text-2xl font-mono mt-1.5 font-bold ${activeIncidentsCount > 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {activeIncidentsCount < 10 ? `0${activeIncidentsCount}` : activeIncidentsCount}
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-[10px] font-mono mb-1 ${activeIncidentsCount > 0 ? 'text-red-400' : 'text-gray-500'}`}>
              {activeIncidentsCount > 0 ? 'System Breach Detected' : 'All parameters normal'}
            </div>
            <div className="w-full bg-[#0B0E14] h-1 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${activeIncidentsCount > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: activeIncidentsCount > 0 ? '100%' : '0%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      {/* Interactive Rich Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-grid">
        <div className="lg:col-span-2 p-5 rounded-lg border border-[#2D333B] bg-[#151921] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D333B] pb-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Continuous Resource Telemetry Series</h3>
              <p className="text-[11px] text-gray-400">24-hour aggregate timeline metric representation</p>
            </div>

            {/* Metric Chooser Buttons */}
            <div className="flex items-center rounded bg-[#0B0E14] p-1 border border-[#2D333B] text-xs">
              {(['cpu', 'memory', 'network', 'dbLatency'] as const).map(met => (
                <button
                  key={met}
                  id={`btn-metric-chart-${met}`}
                  onClick={() => setChartMetric(met)}
                  className={`px-2.5 py-1 font-semibold rounded transition-colors uppercase ${
                    chartMetric === met
                      ? 'bg-[#2D333B] text-blue-400 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {met === 'network' ? 'Net' : met === 'dbLatency' ? 'DB Lat' : met}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adjustedHistory}>
                <defs>
                  <linearGradient id="chartColorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={
                        chartMetric === 'cpu'
                          ? '#3b82f6'
                          : chartMetric === 'memory'
                          ? '#06b6d4'
                          : chartMetric === 'network'
                          ? '#10b981'
                          : '#eab308'
                      }
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        chartMetric === 'cpu'
                          ? '#3b82f6'
                          : chartMetric === 'memory'
                          ? '#06b6d4'
                          : chartMetric === 'network'
                          ? '#10b981'
                          : '#eab308'
                      }
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D333B" vert={false} />
                <XAxis dataKey="timestamp" stroke="#888888" fontSize={9} fontStyle="mono" tickLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={9}
                  fontStyle="mono"
                  tickLine={false}
                  label={{
                    value:
                      chartMetric === 'network'
                        ? 'Traffic (MB/s)'
                        : chartMetric === 'dbLatency'
                        ? 'Latency (ms)'
                        : 'Percent (%)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#888888',
                    fontSize: 8
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151921',
                    borderColor: '#2D333B',
                    borderRadius: '4px',
                    color: '#E0E0E0',
                    fontFamily: 'monospace',
                    fontSize: '11px'
                  }}
                />
                {chartMetric === 'cpu' && (
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    name="CPU Utilization"
                    stroke="#3B82F6"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#chartColorGrad)"
                  />
                )}
                {chartMetric === 'memory' && (
                  <Area
                    type="monotone"
                    dataKey="memory"
                    name="Memory Saturation"
                    stroke="#06B6D4"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#chartColorGrad)"
                  />
                )}
                {chartMetric === 'network' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="networkIn"
                      name="Network Influx"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      fillOpacity={0.05}
                      fill="#10b981"
                    />
                    <Area
                      type="monotone"
                      dataKey="networkOut"
                      name="Network Egress"
                      stroke="#06b6d4"
                      strokeWidth={1.5}
                      fillOpacity={0.0}
                      fill="#06b6d4"
                    />
                  </>
                )}
                {chartMetric === 'dbLatency' && (
                  <Area
                    type="monotone"
                    dataKey="dbLatency"
                    name="DB Execution Lag"
                    stroke="#EAB308"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#chartColorGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resources Stack Visualizers (Infrastructure details) */}
        <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Cluster Infrastructure Health</h3>
            <p className="text-xs text-slate-500 mb-4">Kubernetes Pod pools and Service connections</p>
          </div>

          <div className="space-y-4">
            {/* Kubernetes Node saturation */}
            <div className="bg-[#0B0E14] p-4 rounded border border-[#2D333B]">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1 font-sans">
                  <Database className="h-3.5 w-3.5 text-blue-500" /> Kubernetes Host Nodes
                </span>
                <span className="font-mono text-emerald-400">
                  {onlineK8sNodes}/{totalK8sNodes} Online
                </span>
              </div>
              <div className="mt-2.5 w-full bg-[#151921] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalK8sNodes ? (onlineK8sNodes / totalK8sNodes) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-mono">
                System Autopilot &bull; Automated self-healing active.
              </p>
            </div>

            {/* Aurora RDS Connection Pools */}
            <div className="bg-[#0B0E14] p-4 rounded border border-[#2D333B]">
              <div className="flex items-center justify-[#3B82F6] text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1 font-sans">
                  <Network className="h-3.5 w-3.5 text-blue-500" /> Aurora Server Connections
                </span>
                <span className="font-mono text-amber-400">
                  {sqlConnections} / 1200 Max
                </span>
              </div>
              <div className="mt-2.5 w-full bg-[#151921] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(sqlConnections / 1200) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-mono flex items-center justify-between">
                <span>Active Connection Pressure</span>
                <span className="text-amber-400">WARNING Threshold 82%</span>
              </p>
            </div>

            {/* Quick action simulation triggers */}
            <div className="p-4 bg-red-950/20 border border-red-500/10 rounded-md">
              <h4 className="text-xs font-semibold text-rose-300 flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-rose-400" /> SRE Stress Simulators
              </h4>
              <p className="text-[10px] text-gray-400 mb-3 mt-0.5">
                Execute failover tests to trigger real-time alert models
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-sim-cpu"
                  onClick={() => onTriggerAlert('cpu')}
                  className="bg-[#1C212B] hover:bg-[#2D333B] text-[10px] py-1.5 px-3 rounded border border-[#2D333B] text-red-400 transition-colors cursor-pointer text-center font-mono font-bold"
                >
                  💣 Spike VM CPU
                </button>
                <button
                  id="btn-sim-db"
                  onClick={() => onTriggerAlert('database')}
                  className="bg-[#1C212B] hover:bg-[#2D333B] text-[10px] py-1.5 px-3 rounded border border-[#2D333B] text-amber-400 transition-colors cursor-pointer text-center font-mono font-bold"
                >
                  🔥 Saturate DB Pool
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Nodes Inventory List */}
      <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921]" id="nodes-inventory">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Server className="h-4 w-4 text-gray-400" /> Critical Node Hardware Inventory ({runningResources}/{totalResources} Live)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="tbl-inventory">
            <thead>
              <tr className="border-b border-[#2D333B] text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <th className="py-2.5 px-2">Provider</th>
                <th className="py-2.5 px-2">Resource Name</th>
                <th className="py-2.5 px-2">Type</th>
                <th className="py-2.5 px-2">Specs Size</th>
                <th className="py-2.5 px-2">IP Endpoint</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-2 text-right">Telemetry KPIs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D333B]/50 text-xs">
              {activeResources.map(res => (
                <tr key={res.id} className="hover:bg-[#1C212B] transition-colors" id={`row-res-${res.id}`}>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      res.provider === 'aws'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : res.provider === 'gcp'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {res.provider}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-semibold text-slate-200">
                    {res.name}
                  </td>
                  <td className="py-3 px-2 text-slate-400 capitalize">
                    {res.type.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-2 font-mono text-slate-500 text-[11px]">
                    {res.size}
                  </td>
                  <td className="py-3 px-2 font-mono text-slate-400 text-[11px]">
                    {res.ipAddress}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`flex items-center gap-1 font-semibold ${
                      res.status === 'running'
                        ? 'text-emerald-400'
                        : res.status === 'warning'
                        ? 'text-amber-400'
                        : res.status === 'critical'
                        ? 'text-rose-400 font-bold animate-pulse'
                        : 'text-slate-500'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        res.status === 'running'
                          ? 'bg-emerald-400'
                          : res.status === 'warning'
                          ? 'bg-amber-400'
                          : res.status === 'critical'
                          ? 'bg-rose-500'
                          : 'bg-slate-600'
                      }`} />
                      {res.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-mono" id={`kpis-res-${res.id}`}>
                    {res.status === 'terminated' ? (
                      <span className="text-slate-600">OFFLINE</span>
                    ) : (
                      <div className="flex justify-end gap-3 text-[10px]">
                        <span className={res.metrics.cpu > 80 ? 'text-rose-400 font-bold' : 'text-indigo-300'}>
                          CPU: {res.metrics.cpu}%
                        </span>
                        <span className={res.metrics.memory > 85 ? 'text-rose-400 font-bold' : 'text-blue-300'}>
                          RAM: {res.metrics.memory}%
                        </span>
                        {res.metrics.dbConnections && (
                          <span className="text-amber-400 font-medium">
                            CONN: {res.metrics.dbConnections}
                          </span>
                        )}
                        {res.metrics.k8sNodesOnline !== undefined && (
                          <span className="text-emerald-400 font-medium">
                            NODES: {res.metrics.k8sNodesOnline}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
