/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Issue, IssueSeverity } from "../types";
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Flame,
  Droplet,
  Cone,
  Lightbulb,
  Trash2,
  Car,
  AlertTriangle,
  Info,
  Calendar,
  User,
  ShieldAlert
} from "lucide-react";

interface MapViewProps {
  issues: Issue[];
  selectedWard: string;
  onSelectWard: (ward: string) => void;
  onSelectIssue: (issue: Issue) => void;
}

// Projection bounds for HeroVille coordinates
const MIN_LNG = -122.4400;
const MAX_LNG = -122.4000;
const MIN_LAT = 37.7600;
const MAX_LAT = 37.7900;

// Ward polygons for the vector backdrop
const WARD_POLYGONS = [
  {
    id: "Ward 4: Downtown Central",
    name: "Downtown Central (Ward 4)",
    color: "fill-blue-500/10 stroke-blue-500/40 hover:fill-blue-500/20",
    points: [
      [-122.425, 37.785],
      [-122.410, 37.785],
      [-122.410, 37.768],
      [-122.425, 37.768]
    ]
  },
  {
    id: "Ward 7: Lakeside Promenade",
    name: "Lakeside Promenade (Ward 7)",
    color: "fill-teal-500/10 stroke-teal-500/40 hover:fill-teal-500/20",
    points: [
      [-122.440, 37.790],
      [-122.425, 37.790],
      [-122.425, 37.772],
      [-122.440, 37.772]
    ]
  },
  {
    id: "Ward 9: Green Hills Residential",
    name: "Green Hills (Ward 9)",
    color: "fill-emerald-500/10 stroke-emerald-500/40 hover:fill-emerald-500/20",
    points: [
      [-122.440, 37.772],
      [-122.425, 37.772],
      [-122.425, 37.760],
      [-122.440, 37.760]
    ]
  },
  {
    id: "Ward 2: Industrial Corridor",
    name: "Industrial Corridor (Ward 2)",
    color: "fill-amber-500/10 stroke-amber-500/40 hover:fill-amber-500/20",
    points: [
      [-122.425, 37.768],
      [-122.410, 37.768],
      [-122.410, 37.760],
      [-122.425, 37.760]
    ]
  }
];

export function MapView({ issues, selectedWard, onSelectWard, onSelectIssue }: MapViewProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showWards, setShowWards] = useState<boolean>(true);
  const [showResolved, setShowResolved] = useState<boolean>(true);
  const [activePopup, setActivePopup] = useState<Issue | null>(null);

  // Map settings
  const width = 800;
  const height = 500;

  // Coordinate projection formula: Linear interpolation
  const project = useMemo(() => {
    return (lng: number, lat: number) => {
      const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * width;
      // SVG Y goes down, so flip it
      const y = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * height;
      return { x, y };
    };
  }, []);

  const filteredIssuesForMap = useMemo(() => {
    return issues.filter(issue => {
      if (!showResolved && issue.status === "Resolved") return false;
      return true;
    });
  }, [issues, showResolved]);

  // SVG representation of wards
  const svgWards = useMemo(() => {
    return WARD_POLYGONS.map(ward => {
      const pathPoints = ward.points.map(pt => {
        const projected = project(pt[0], pt[1]);
        return `${projected.x},${projected.y}`;
      }).join(" ");

      const isSelected = selectedWard === ward.id;

      return (
        <polygon
          key={ward.id}
          points={pathPoints}
          className={`${ward.color} cursor-pointer transition-all duration-300 ${
            isSelected ? "fill-sky-500/30 stroke-sky-400 stroke-2" : "stroke-1"
          }`}
          onClick={() => onSelectWard(selectedWard === ward.id ? "all" : ward.id)}
        />
      );
    });
  }, [selectedWard, onSelectWard, project]);

  // Category Icon helper
  const getCategoryIcon = (category: string, size = 16) => {
    switch (category) {
      case "Pothole":
        return <Cone size={size} className="text-amber-500" />;
      case "Water Leakage":
        return <Droplet size={size} className="text-sky-500" />;
      case "Streetlight":
        return <Lightbulb size={size} className="text-yellow-500" />;
      case "Waste":
        return <Trash2 size={size} className="text-teal-600" />;
      case "Traffic":
        return <Car size={size} className="text-rose-500" />;
      default:
        return <ShieldAlert size={size} className="text-gray-500" />;
    }
  };

  // Severity color helpers
  const getSeverityBgColor = (severity: IssueSeverity) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-500";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-amber-500";
      case "Low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-slate-400 border-slate-500";
      case "VerificationPending":
        return "bg-yellow-500 border-yellow-600 animate-pulse";
      case "Verified":
        return "bg-green-500 border-green-600";
      case "Acknowledged":
        return "bg-blue-500 border-blue-600";
      case "InProgress":
        return "bg-orange-500 border-orange-600";
      case "Resolved":
        return "bg-emerald-500 border-emerald-600";
      default:
        return "bg-rose-500 border-rose-600";
    }
  };

  return (
    <div id="map-section" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Map Actions Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="text-sky-600" size={18} />
          <h3 className="font-display font-semibold text-slate-800 text-sm">Interactive City Ward Map</h3>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="toggle-wards-btn"
            onClick={() => setShowWards(!showWards)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              showWards
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Ward Borders
          </button>
          <button
            id="toggle-heatmap-btn"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors border ${
              showHeatmap
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Flame size={12} /> Heatmap
          </button>
          <button
            id="toggle-resolved-btn"
            onClick={() => setShowResolved(!showResolved)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              showResolved
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Show Resolved
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-slate-950 min-h-[400px] flex items-center justify-center overflow-hidden select-none">
        {/* Backdrop Grid lines */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-5 pointer-events-none">
          {Array.from({ length: 72 }).map((_, i) => (
            <div key={i} className="border border-white/20" />
          ))}
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full max-h-[500px] transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Radial heat gradients when enabled */}
          {showHeatmap && (
            <g id="heatmap-layer">
              {filteredIssuesForMap.map((issue) => {
                const projected = project(issue.location.coordinates[0], issue.location.coordinates[1]);
                let radius = 30;
                let opacity = "opacity-40";

                if (issue.severity === "Critical") {
                  radius = 60;
                  opacity = "opacity-75";
                } else if (issue.severity === "High") {
                  radius = 45;
                  opacity = "opacity-55";
                }

                return (
                  <g key={`heat-${issue._id}`} className={`transition-all duration-500 ${opacity}`}>
                    <defs>
                      <radialGradient id={`grad-${issue._id}`}>
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                        <stop offset="40%" stopColor="#f97316" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                      </radialGradient>
                    </defs>
                    <circle
                      cx={projected.x}
                      cy={projected.y}
                      r={radius}
                      fill={`url(#grad-${issue._id})`}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Ward Boundaries Backdrop */}
          {showWards && <g id="wards-layer">{svgWards}</g>}

          {/* Grid annotations */}
          <text x={20} y={30} className="fill-slate-500 font-mono text-[9px] font-medium tracking-widest uppercase">HeroVille Geographic Hub</text>

          {/* Plotted Issue Pins */}
          <g id="pins-layer">
            {filteredIssuesForMap.map((issue) => {
              const projected = project(issue.location.coordinates[0], issue.location.coordinates[1]);
              const isSelected = activePopup?._id === issue._id;

              return (
                <g
                  key={issue._id}
                  transform={`translate(${projected.x}, ${projected.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePopup(issue);
                  }}
                >
                  {/* Pulsing ring for high severity */}
                  {(issue.severity === "Critical" || issue.severity === "High") && (
                    <circle
                      r="16"
                      className="fill-none stroke-rose-500/40 stroke-[1.5] animate-ping opacity-60"
                    />
                  )}

                  {/* Marker Pin Outer */}
                  <circle
                    r={isSelected ? "11" : "8"}
                    className={`stroke-white stroke-2 shadow-lg transition-all duration-200 ${
                      isSelected ? "fill-sky-500 scale-125" : getStatusColor(issue.status)
                    }`}
                  />

                  {/* Inner Category Dot/Pulse */}
                  <circle
                    r={isSelected ? "4" : "3"}
                    className="fill-white"
                  />

                  {/* Tiny label on hover */}
                  <g className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                    <rect
                      x="-60"
                      y="-32"
                      width="120"
                      height="18"
                      rx="4"
                      className="fill-slate-900/90"
                    />
                    <text
                      x="0"
                      y="-20"
                      textAnchor="middle"
                      className="fill-white font-sans text-[8px] font-semibold"
                    >
                      {issue.title.length > 20 ? issue.title.slice(0, 18) + "..." : issue.title}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Mini Controls Map Panel */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10 z-10">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.75))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => { setZoom(1); setActivePopup(null); }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            title="Reset View"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Legend Panel */}
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-white font-mono text-[9px] flex flex-col gap-1 z-10 max-w-[150px]">
          <div className="font-semibold border-b border-white/10 pb-1 mb-1 text-slate-400 uppercase tracking-wider text-[8px]">Status Pipeline</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" /> Submitted</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /> Pending Sync</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Verified</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Acknowledged</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> In Progress</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Resolved</div>
        </div>

        {/* Popover Details Modal when selecting pin */}
        {activePopup && (
          <div className="absolute bottom-4 right-4 left-16 md:left-auto md:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-20 animate-in slide-in-from-bottom-5 duration-200">
            <button
              onClick={() => setActivePopup(null)}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 font-bold text-xs p-1"
            >
              ✕
            </button>
            <div className="flex gap-2 mb-2">
              <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-semibold ${getSeverityBgColor(activePopup.severity)}`}>
                {activePopup.severity} Severity
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {activePopup.status}
              </span>
            </div>

            <h4 className="font-display font-bold text-slate-900 text-xs line-clamp-1 mb-1">{activePopup.title}</h4>
            <p className="text-slate-500 text-[11px] line-clamp-2 mb-2">{activePopup.description}</p>

            <div className="grid grid-cols-2 gap-1.5 border-t border-b border-slate-100 py-1.5 mb-3 text-[10px] text-slate-600 font-mono">
              <div className="flex items-center gap-1 truncate">
                {getCategoryIcon(activePopup.categoryUser, 12)}
                <span>{activePopup.categoryUser}</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <MapPin size={12} className="text-sky-500" />
                <span>{activePopup.location.ward.split(":")[0]}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Calendar size={11} />
                <span>{new Date(activePopup.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                id={`inspect-issue-${activePopup._id}`}
                onClick={() => {
                  onSelectIssue(activePopup);
                  setActivePopup(null);
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-[10px] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                Inspect Issue →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ward Switcher Sidebar for accessibility */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-2">
        {WARD_POLYGONS.map((w) => {
          const isSelected = selectedWard === w.id;
          const count = issues.filter(i => i.location.ward === w.id).length;
          const resolved = issues.filter(i => i.location.ward === w.id && i.status === "Resolved").length;

          return (
            <button
              id={`ward-selector-${w.id.replace(/[^a-zA-Z0-9]/g, "-")}`}
              key={w.id}
              onClick={() => onSelectWard(isSelected ? "all" : w.id)}
              className={`p-2 rounded-xl text-left transition-all border text-xs flex flex-col justify-between ${
                isSelected
                  ? "bg-sky-50 border-sky-200 ring-2 ring-sky-500/20"
                  : "bg-white hover:bg-slate-50 border-slate-200"
              }`}
            >
              <div className="font-semibold text-slate-800 truncate mb-1 text-[11px]">{w.name.split(" (")[0]}</div>
              <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
                <span>Active: {count - resolved}</span>
                <span className="text-emerald-600">Fixed: {resolved}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
