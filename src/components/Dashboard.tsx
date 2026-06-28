/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { getDashboardMetrics, getHotspotPredictions } from "../api";
import { DashboardMetrics, HotspotForecast } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Activity,
  CheckCircle,
  Users,
  Award,
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowUpRight
} from "lucide-react";

const COLORS = ["#1E5BA8", "#2ECC71", "#F39C12", "#E67E22", "#E74C3C", "#95A5A6"];
const SEVERITY_COLORS = {
  Low: "#3498DB",
  Medium: "#F39C12",
  High: "#E67E22",
  Critical: "#C0392B"
};

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [predictions, setPredictions] = useState<HotspotForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"impact" | "forecast">("impact");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([getDashboardMetrics(), getHotspotPredictions()]);
      setMetrics(m);
      setPredictions(p);
    } catch (err) {
      console.error("Dashboard statistics loading failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <RefreshCw className="animate-spin text-sky-600 mb-3" size={32} />
        <span className="text-slate-500 font-mono text-xs">Computing real-time GIS analytics & predictive models...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 text-slate-400">
        Could not retrieve system statistics.
      </div>
    );
  }

  // Pre-process severity color items
  const severityData = metrics.severityBreakdown.map(item => ({
    ...item,
    color: (SEVERITY_COLORS as any)[item.name] || "#94a3b8"
  }));

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveTab("impact")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "impact" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Activity size={14} /> City Impact metrics
        </button>
        <button
          onClick={() => setActiveTab("forecast")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "forecast" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles size={14} className="text-amber-500" /> AI Predictive Hotspots
        </button>
      </div>

      {activeTab === "impact" ? (
        /* TAB 1: CORE IMPACT DASHBOARD */
        <div className="space-y-6">
          {/* Top Level KPIs Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-medium">Total Reported</div>
                <div className="text-2xl font-display font-bold text-slate-900 mt-0.5">{metrics.totalIssues}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle size={20} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-medium">Fixed & Resolved</div>
                <div className="text-2xl font-display font-bold text-emerald-600 mt-0.5">{metrics.resolvedIssues}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <Clock size={20} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-medium">In Pipeline</div>
                <div className="text-2xl font-display font-bold text-slate-900 mt-0.5">{metrics.pendingIssues}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-medium">Active Citizens</div>
                <div className="text-2xl font-display font-bold text-slate-900 mt-0.5">{metrics.activeCitizens}</div>
              </div>
            </div>
          </div>

          {/* Interactive Chart Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Time Series Area Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-8 flex flex-col">
              <div className="mb-4">
                <h4 className="font-display font-bold text-slate-900 text-sm">Filing vs Resolution Velocity</h4>
                <p className="text-slate-500 text-xs">Comparison trend of incoming citizen filings and completed repairs.</p>
              </div>
              <div className="w-full h-64 mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E5BA8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#1E5BA8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontStyle="italic" />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Area type="monotone" dataKey="reported" name="Submitted" stroke="#1E5BA8" fillOpacity={1} fill="url(#colorReported)" strokeWidth={2} />
                    <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#2ECC71" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Donut Severity Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-4 flex flex-col items-center">
              <div className="mb-4 w-full text-left">
                <h4 className="font-display font-bold text-slate-900 text-sm font-semibold">Incident Severity Impact</h4>
                <p className="text-slate-500 text-xs">Public hazard diagnostic categorizations.</p>
              </div>
              <div className="w-full h-48 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center stats */}
                <div className="absolute text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-medium">Critical</span>
                  <div className="text-xl font-bold font-display text-rose-600">
                    {metrics.severityBreakdown.find(s => s.name === "Critical")?.value || 0}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-auto w-full text-[10px] font-mono text-slate-600 pt-3 border-t border-slate-100">
                {severityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 3. Category Breakdown Bar Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-6 flex flex-col">
              <div className="mb-4">
                <h4 className="font-display font-bold text-slate-900 text-sm">Issue Densities by Category</h4>
                <p className="text-slate-500 text-xs">Volume distribution of typical local infrastructure breakdowns.</p>
              </div>
              <div className="w-full h-60 mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                    <Bar dataKey="value" name="Report Count" radius={[4, 4, 0, 0]}>
                      {metrics.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Ward comparisons */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-6 flex flex-col">
              <div className="mb-4">
                <h4 className="font-display font-bold text-slate-900 text-sm">Active vs Resolved by Municipal Ward</h4>
                <p className="text-slate-500 text-xs">Efficiency of municipal dispatch patching reported failures.</p>
              </div>
              <div className="w-full h-60 mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.wardBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar dataKey="count" name="Total Filed" fill="#1e293b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" name="Total Resolved" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: AI PREDICTIVE HOTSPOTS FORECASTING */
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl flex gap-3.5">
            <Sparkles className="text-amber-600 shrink-0 mt-0.5 animate-pulse" size={24} />
            <div className="text-xs text-slate-700 space-y-1">
              <h4 className="font-display font-bold text-slate-900 text-sm">Gemini AI Infrastructure Risk Engine</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                By cross-referencing public historical reports, geographic topography elements, seasonal precipitation vectors, and infrastructure material aging equations, Gemini AI models forecast failure liabilities 30 days in advance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions.map((p, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 hover:border-amber-300 hover:shadow-md transition-all group"
              >
                {/* Header info */}
                <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                  <div>
                    <h5 className="font-display font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">{p.ward}</h5>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono mt-1 inline-block">
                      Primary Threat: {p.dominantCategory}
                    </span>
                  </div>

                  {/* Risk Badge Dial */}
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="text-[9px] font-mono font-medium uppercase text-slate-400">Risk Score</div>
                      <div className="text-lg font-bold font-display text-slate-800 tracking-tight">{p.riskScore}%</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center relative overflow-hidden shrink-0 border border-slate-200">
                      {/* Simulated circular gauge bar */}
                      <div
                        className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-orange-500 to-amber-500 transition-all duration-1000"
                        style={{ height: `${p.riskScore}%` }}
                      />
                      <span className="absolute text-[10px] font-bold text-slate-900 group-hover:scale-110 transition-transform">{p.predictedCount}</span>
                    </div>
                  </div>
                </div>

                {/* Forecast diagnostics */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Failure Diagnostics reasoning</span>
                    <p className="text-slate-600 text-xs leading-relaxed italic">
                      &ldquo;{p.reasoning}&rdquo;
                    </p>
                  </div>

                  {/* Actions recommend */}
                  <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1 font-mono">
                      <Zap size={11} className="text-amber-500" /> Preventative Mitigation action
                    </span>
                    <p className="text-slate-700 text-xs leading-relaxed font-sans">
                      {p.preventativeSteps}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-50 pt-3">
                  <span className="flex items-center gap-1 font-mono">
                    Model: gemini-3.5-flash
                  </span>
                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {p.confidence}% Confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
