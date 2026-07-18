import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Zap,
  TrendingDown,
  Info,
  Layers,
  ArrowUpRight,
  TrendingUpIcon,
  Server,
  Activity,
  Award,
  RefreshCw,
  HelpCircle,
  PlayCircle
} from 'lucide-react';
import { CostMetric, RightsizingRecommendation, CloudProvider } from '../types';

interface CostOptimizationViewProps {
  costMetrics: CostMetric[];
  rightsizingRecommendations: RightsizingRecommendation[];
  onTriggerAuditLog: (action: string) => void;
}

export default function CostOptimizationView({
  costMetrics,
  rightsizingRecommendations,
  onTriggerAuditLog
}: CostOptimizationViewProps) {
  const [selectedProviderTab, setSelectedProviderTab] = useState<'all' | CloudProvider>('all');
  const [forecastMultipliers, setForecastMultipliers] = useState<number>(1.0); // 1.0 = Default, 1.2 = Aggressive Growth, 0.8 = Optimizing

  // Key stats selection state
  const [aiRecId, setAiRecId] = useState<string | null>(null);
  const [isGeneratingRules, setIsGeneratingRules] = useState(false);
  const [aiResizingPlan, setAiResizingPlan] = useState<string | null>(null);

  // Compute actual expenditures sums
  const totalCostCurrent = costMetrics.reduce((acc, curr) => acc + curr.amount, 0);

  // Filter metrics list
  const activeMetrics = costMetrics.filter(
    m => selectedProviderTab === 'all' || m.provider === selectedProviderTab
  );

  const filteredCostTotal = activeMetrics.reduce((acc, curr) => acc + curr.amount, 0);

  // Compile dataset for Provider spend Pie chart
  const providerSpendData = [
    { name: 'AWS', value: costMetrics.filter(m => m.provider === 'aws').reduce((a, c) => a + c.amount, 0), color: '#f59e0b' },
    { name: 'Google Cloud', value: costMetrics.filter(m => m.provider === 'gcp').reduce((a, c) => a + c.amount, 0), color: '#3b82f6' },
    { name: 'Microsoft Azure', value: costMetrics.filter(m => m.provider === 'azure').reduce((a, c) => a + c.amount, 0), color: '#6366f1' }
  ].filter(v => v.value > 0);

  // Compile dataset for Service spend Bar chart
  const serviceSpendMap: Record<string, number> = {};
  activeMetrics.forEach(m => {
    serviceSpendMap[m.service] = (serviceSpendMap[m.service] || 0) + m.amount;
  });
  const serviceSpendData = Object.entries(serviceSpendMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Forecast calculations (Next 3 months based on multiplier parameters)
  const monthlyCostForecast = totalCostCurrent * forecastMultipliers;
  const threeMonthsForecastTotal = monthlyCostForecast * 3;
  const totalPotentialSavings = rightsizingRecommendations.reduce((a, c) => a + c.estimatedMonthlySavings, 0);

  // AI Commands generator caller
  const handleGenerateResizePlan = async (rec: RightsizingRecommendation) => {
    setAiRecId(rec.id);
    setIsGeneratingRules(true);
    setAiResizingPlan(null);

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'recommendation', payload: rec })
      });
      const data = await res.json();
      if (data.analysis) {
        setAiResizingPlan(data.analysis);
        onTriggerAuditLog(`Invoked Gemini AI resize commands compiler for resource: ${rec.resourceName}`);
      } else {
        setAiResizingPlan('Unable to generate terminal provisioning script.');
      }
    } catch (err: any) {
      setAiResizingPlan(`Failed to compile script: ${err.message}`);
    } finally {
      setIsGeneratingRules(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="cost-finops-view">
      {/* KPI Tiles overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="cost-kpis-grid">
        {/* Total Cloud Spend */}
        <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-amber-500" /> Aggregate June Spend
            </span>
            <span className="text-[9px] font-mono font-bold text-[#E2E8F0] bg-[#1C212B] px-2 py-0.5 rounded border border-[#2D333B]">
              Active Billing Cycle
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              ${totalCostCurrent.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-mono">/mo</span>
          </div>
          <p className="text-[10px] text-gray-450 mt-2 font-mono">
            Accumulated budget limit: $45,000 max cap
          </p>
        </div>

        {/* Potential Savings FinOps */}
        <div className="p-5 rounded-lg border border-emerald-500/20 bg-[#151921] relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#4ADE80] tracking-widest flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" /> Potential FinOps Release
            </span>
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Optimization
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-400">
              ${totalPotentialSavings.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-500 font-mono">/mo</span>
          </div>
          <p className="text-[10px] text-gray-450 mt-2 font-mono">
            Requires resizing {rightsizingRecommendations.length} idle VM nodes
          </p>
        </div>

        {/* Forecasted Next Month */}
        <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-[#818CF8]" /> Forecast Projections
            </span>
            <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              3-Month Predict
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              ${threeMonthsForecastTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-gray-500 font-mono">total period</span>
          </div>
          {/* Active dynamic forecasting controls */}
          <div className="flex items-center gap-1.5 mt-2.5 text-[10px] overflow-hidden">
            <span className="text-gray-500 font-semibold font-mono">Simulate Scale:</span>
            <div className="flex items-center gap-1 bg-[#0B0E14] p-0.5 rounded border border-[#2D333B]">
              <button
                type="button"
                id="forecast-opt"
                onClick={() => setForecastMultipliers(0.85)}
                className={`px-2 py-0.5 rounded-sm text-[9px] font-semibold transition-colors ${forecastMultipliers === 0.85 ? 'bg-[#2D333B] text-emerald-450 font-bold' : 'text-gray-500 hover:text-white'}`}
              >
                85% Opt
              </button>
              <button
                type="button"
                id="forecast-base"
                onClick={() => setForecastMultipliers(1.0)}
                className={`px-2 py-0.5 rounded-sm text-[9px] font-semibold transition-colors ${forecastMultipliers === 1.0 ? 'bg-[#2D333B] text-blue-400 font-bold' : 'text-gray-500 hover:text-white'}`}
              >
                Baseline
              </button>
              <button
                type="button"
                id="forecast-scale"
                onClick={() => setForecastMultipliers(1.3)}
                className={`px-2 py-0.5 rounded-sm text-[9px] font-semibold transition-colors ${forecastMultipliers === 1.3 ? 'bg-[#2D333B] text-indigo-400 font-bold' : 'text-gray-500 hover:text-white'}`}
              >
                Growth
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="cost-charts-grid">
        {/* Provider distribution Pie Chart */}
        <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Expenditure Share by Cloud Platform</h3>
            <p className="text-[11px] text-gray-400">Percentage breakdown of connected accounts invoices</p>
          </div>

          <div className="h-64 flex flex-col sm:flex-row items-center gap-4 mt-4">
            <div className="h-full w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerSpendData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {providerSpendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0E14',
                      borderColor: '#2D333B',
                      borderRadius: '4px',
                      color: '#E0E0E0',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              {providerSpendData.map(prov => {
                const pct = ((prov.value / totalCostCurrent) * 100).toFixed(1);
                return (
                  <div key={prov.name} className="flex items-center justify-between p-2.5 rounded bg-[#0B0E14] border border-[#2D333B]">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: prov.color }} />
                      <span className="font-semibold text-gray-300">{prov.name}</span>
                    </div>

                    <div className="font-mono text-slate-200 text-right">
                      <div className="font-bold text-white">${prov.value.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500">{pct}% share</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Service spending metrics (BarChart) */}
        <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4 border-b border-[#2D333B] pb-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Invoice Sum by Cloud Service</h3>
              <p className="text-[11px] text-gray-400">Service classifications spend metrics</p>
            </div>

            {/* Provider filtering tab selector */}
            <div className="flex items-center rounded bg-[#0B0E14] p-1 border border-[#2D333B] text-[10px]">
              {(['all', 'aws', 'gcp', 'azure'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  id={`btn-cost-filter-${p}`}
                  onClick={() => setSelectedProviderTab(p)}
                  className={`px-2 py-0.5 rounded font-semibold uppercase transition-colors ${
                    selectedProviderTab === p ? 'bg-[#2D333B] text-blue-400 font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceSpendData.slice(0, 5)} layout="vertical" margin={{ left: -15, right: 10, top: 5, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={9} fontStyle="mono" tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} tickLine={false} width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0E14',
                    borderColor: '#2D333B',
                    borderRadius: '4px',
                    color: '#E0E0E0',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey="amount" name="Spend sum ($)" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {serviceSpendData.map((e, i) => (
                    <Cell
                      key={`bar-cell-${i}`}
                      fill={
                        selectedProviderTab === 'aws'
                          ? '#f59e0b'
                          : selectedProviderTab === 'gcp'
                          ? '#3b82f6'
                          : selectedProviderTab === 'azure'
                          ? '#6366f1'
                          : '#2563EB'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Unused & Overprovisioned Resources: Rightsizing recommendations */}
      <div className="p-5 rounded-lg border border-[#2D333B] bg-[#151921]" id="rightsizing-recs">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Award className="h-4 w-4 text-emerald-400 font-bold" /> FinOps Idle Resources & Rightsizing Recommendations ({rightsizingRecommendations.length})
        </h3>

        <div className="space-y-4">
          {rightsizingRecommendations.map(rec => {
            const isRecSelected = aiRecId === rec.id;

            return (
              <div
                key={rec.id}
                id={`rec-item-${rec.id}`}
                className="p-4.5 rounded bg-[#0B0E14] border border-[#2D333B] hover:border-gray-700 flex flex-col justify-between gap-4 transition-colors"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 rounded shrink-0">
                      <Server className="h-4 w-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
                        <span className="px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-[#151921] text-gray-400 border border-[#2D333B]/50">
                          {rec.provider}
                        </span>
                        <span className="font-mono text-gray-500">
                          ID: {rec.resourceId}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                          rec.confidenceRating === 'high' ? 'bg-emerald-500/10 text-[#4ADE80] border border-emerald-550/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rec.confidenceRating} confidence
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white">{rec.resourceName}</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
                        Reason: <span className="text-gray-300 font-normal">{rec.reasoning}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-500">Estimated Saving</span>
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      + ${rec.estimatedMonthlySavings.toFixed(2)} /mo
                    </div>
                  </div>
                </div>

                {/* Configurations specs step layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#151921] p-3 rounded border border-[#2D333B]/80 text-xs font-mono">
                  <div>
                    <span className="text-rose-400 font-bold uppercase text-[9px] tracking-wider block">Current Rig Configuration</span>
                    <div className="text-gray-400 mt-0.5 text-[11px]">{rec.currentConfiguration}</div>
                  </div>
                  <div>
                    <span className="text-emerald-450 font-bold uppercase text-[9px] tracking-wider block">Recommended Rig Resize</span>
                    <div className="text-gray-300 mt-0.5 text-[11px]">{rec.recommendedConfiguration}</div>
                  </div>
                </div>

                {/* AI execution command trigger */}
                <div className="pt-2 border-t border-[#2D333B]/40">
                  {isRecSelected && aiResizingPlan ? (
                    <div className="p-4 rounded bg-[#151921] border border-[#2D333B] space-y-3 font-sans text-xs">
                      <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-[#2D333B] pb-2">
                        <Zap className="h-4 w-4 text-emerald-400" /> SRE AI Automation Script Generator
                      </div>
                      <div className="text-gray-300 space-y-2 leading-relaxed">
                        {aiResizingPlan.split('\n').map((line, idx) => {
                          if (line.startsWith('###')) {
                            return <h4 key={idx} className="text-xs font-bold text-blue-400 mt-2">{line.replace('###', '')}</h4>;
                          }
                          if (line.startsWith('```')) {
                            return null;
                          }
                          // Custom terminal styling for command snippets
                          if (line.trim().startsWith('gcloud') || line.trim().startsWith('aws ') || line.trim().startsWith('#')) {
                            return <pre key={idx} className="bg-[#0B0E14] p-3 text-emerald-400 font-mono rounded border border-[#2D333B] text-[10px] my-1.5 overflow-x-auto whitespace-pre-wrap">{line}</pre>;
                          }
                          return <p key={idx}>{line}</p>;
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1 font-semibold">
                        <Info className="h-3.5 w-3.5" /> Handshake deployment ready via cloud integration connector
                      </span>
                      <button
                        type="button"
                        id={`btn-compile-resize-cli-${rec.id}`}
                        disabled={isGeneratingRules && aiRecId === rec.id}
                        onClick={() => handleGenerateResizePlan(rec)}
                        className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-750 text-white font-bold px-3 py-1.5 rounded text-[10.5px] transition-colors cursor-pointer disabled:opacity-50 font-sans"
                      >
                        {isGeneratingRules && aiRecId === rec.id ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                            Compiling resize command scripts ...
                          </>
                        ) : (
                          <>
                            <Zap className="h-3.5 w-3.5 fill-white text-white" />
                            Review CLI Shell execution (AI)
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
      </div>
    </div>
  );
}
