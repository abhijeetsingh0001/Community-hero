/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../api";
import { User } from "../types";
import {
  Trophy,
  Award,
  Flame,
  Search,
  Zap,
  CheckCircle,
  Eye,
  Sparkles,
  FileText,
  ShieldCheck,
  CloudRain,
  ShieldAlert,
  Loader2,
  RefreshCw
} from "lucide-react";

const REPUTATION_TIERS = [
  { min: 0, max: 500, label: "Bronze Citizen", color: "text-amber-700 bg-amber-50 border-amber-100" },
  { min: 501, max: 2000, label: "Silver Warden", color: "text-slate-700 bg-slate-50 border-slate-100" },
  { min: 2001, max: 5000, label: "Gold Ambassador", color: "text-yellow-800 bg-yellow-50 border-yellow-200 font-semibold" },
  { min: 5001, max: Infinity, label: "Platinum Council", color: "text-purple-800 bg-purple-50 border-purple-200 font-bold" }
];

const BADGE_TEMPLATES = [
  { id: "first-report", name: "First Report", desc: "Logged initial community problem", icon: Eye, color: "bg-blue-500" },
  { id: "detail-oriented", name: "Detail-Oriented", desc: "Submitted issues with 200+ char descriptions", icon: FileText, color: "bg-purple-500" },
  { id: "keen-eye", name: "Keen Eye", desc: "Completed 10 active verifications", icon: CheckCircle, color: "bg-teal-500" },
  { id: "trusted-verifier", name: "Trusted Verifier", desc: "Achieved Gold validation consensus rank", icon: ShieldCheck, color: "bg-yellow-500" },
  { id: "city-champion", name: "City Champion", desc: "Resolved 10 community issues", icon: Award, color: "bg-emerald-500" },
  { id: "neighborhood-hero", name: "Neighborhood Hero", desc: "Resolved 25+ problems", icon: Sparkles, color: "bg-rose-500" },
  { id: "streak-3", name: "3-Day Streak", desc: "Participation logged 3 consecutive days", icon: Flame, color: "bg-orange-500" },
  { id: "monsoon-hero", name: "Monsoon Savior", desc: "Reported/verified 5 storm drain issues", icon: CloudRain, color: "bg-cyan-500" }
];

export function Leaderboard() {
  const [board, setBoard] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard();
      setBoard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const getReputationLabel = (karma: number) => {
    const tier = REPUTATION_TIERS.find(t => karma >= t.min && karma <= t.max);
    return tier || REPUTATION_TIERS[0];
  };

  const filteredBoard = board.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <RefreshCw className="animate-spin text-sky-600 mb-2" size={24} />
        <span className="text-slate-400 font-mono text-xs ml-2">Loading local rankings...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Top Rankings Table */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 pb-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Trophy className="text-yellow-500" size={18} /> Community Hero rankings
            </h3>
            <p className="text-slate-500 text-xs">Citizens earning reputation through active troubleshooting and verification.</p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              id="leaderboard-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search citizens..."
              className="pl-8 pr-4 py-1.5 bg-slate-50 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-sky-500 border border-slate-100 focus:border-sky-500 transition-all w-48 text-slate-700"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 font-medium">Rank</th>
                <th className="py-2.5 font-medium">Hero Profile</th>
                <th className="py-2.5 font-medium">Reputation Tier</th>
                <th className="py-2.5 font-medium text-center">Reports</th>
                <th className="py-2.5 font-medium text-center">Verifies</th>
                <th className="py-2.5 font-medium text-right">Karma Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {filteredBoard.map((u, idx) => {
                const rep = getReputationLabel(u.karma);
                const rank = idx + 1;

                return (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Rank cell */}
                    <td className="py-3 font-mono font-bold">
                      {rank === 1 ? (
                        <span className="bg-yellow-100 text-yellow-800 w-5 h-5 rounded-full flex items-center justify-center border border-yellow-300 text-[10px]">🥇</span>
                      ) : rank === 2 ? (
                        <span className="bg-slate-100 text-slate-800 w-5 h-5 rounded-full flex items-center justify-center border border-slate-300 text-[10px]">🥈</span>
                      ) : rank === 3 ? (
                        <span className="bg-amber-100 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center border border-amber-300 text-[10px]">🥉</span>
                      ) : (
                        <span className="text-slate-400 pl-1.5 font-mono">#{rank}</span>
                      )}
                    </td>

                    {/* Name / Profile cell */}
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          referrerPolicy="no-referrer"
                          src={u.profilePicture}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            {u.name}
                            {u.role === "Leader" && (
                              <span className="text-[8px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">Leader</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">Member: {new Date(u.registeredAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>

                    {/* Reputation badge */}
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md border text-[9px] font-mono uppercase ${rep.color}`}>
                        {rep.label}
                      </span>
                    </td>

                    {/* Counts */}
                    <td className="py-3 text-center font-mono font-medium">{u.reportCount || 0}</td>
                    <td className="py-3 text-center font-mono font-medium">{u.verificationCount || 0}</td>

                    {/* Karma points */}
                    <td className="py-3 text-right">
                      <span className="font-display font-bold text-slate-900 bg-sky-50 text-sky-800 px-2 py-1 rounded-lg border border-sky-100">
                        {u.karma} K
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Available Badges Guide Showcase */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Award className="text-purple-600" size={18} /> Hero Badges Guide
          </h3>
          <p className="text-slate-500 text-xs">Unlock exclusive profiles visual badges and increase your verification weight.</p>
        </div>

        {/* Badges Grid */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {BADGE_TEMPLATES.map((b) => {
            const Icon = b.icon;

            return (
              <div key={b.id} className="flex gap-3 p-2 rounded-xl border border-slate-50 hover:border-slate-100 bg-slate-50/20 group transition-all">
                <div className={`${b.color} text-white p-2 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon size={16} />
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-semibold text-slate-800">{b.name}</div>
                  <p className="text-slate-500 leading-snug text-[10px]">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
