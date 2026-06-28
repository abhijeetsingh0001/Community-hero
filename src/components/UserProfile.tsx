/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User } from "../types";
import {
  Award,
  Flame,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  ShieldCheck,
  Sparkles,
  CloudRain,
  Bell,
  Mail,
  Sliders,
  CheckSquare,
  Bookmark,
  Smartphone,
  Check
} from "lucide-react";

interface UserProfileProps {
  user: User;
  onUpdatePreferences: (updatedUser: User) => void;
}

const BADGE_TEMPLATES = [
  { id: "first-report", name: "First Report", icon: Eye, color: "from-blue-500 to-indigo-500", desc: "Submitted initial problem" },
  { id: "detail-oriented", name: "Detail-Oriented", icon: FileText, color: "from-purple-500 to-pink-500", desc: "Rich description submission" },
  { id: "keen-eye", name: "Keen Eye", icon: CheckCircle, color: "from-teal-500 to-emerald-500", desc: "Verified 10 reports" },
  { id: "trusted-verifier", name: "Trusted Verifier", icon: ShieldCheck, color: "from-yellow-500 to-amber-600", desc: "Gold status verifier" },
  { id: "city-champion", name: "City Champion", icon: Award, color: "from-emerald-500 to-cyan-500", desc: "Resolved 10 reports" },
  { id: "neighborhood-hero", name: "Neighborhood Hero", icon: Sparkles, color: "from-rose-500 to-red-600", desc: "Resolved 25+ reports" },
  { id: "streak-3", name: "3-Day Streak", icon: Flame, color: "from-orange-500 to-yellow-500", desc: "Active 3 consecutive days" },
  { id: "monsoon-hero", name: "Monsoon Savior", icon: CloudRain, color: "from-cyan-500 to-blue-600", desc: "5 drainage reports filed" }
];

export function UserProfile({ user, onUpdatePreferences }: UserProfileProps) {
  const [preferredCategories, setPreferredCategories] = useState<string[]>(user.preferredCategories || []);
  const [statusUpdates, setStatusUpdates] = useState<boolean>(user.notificationSettings?.statusUpdates ?? true);
  const [nearbyIssues, setNearbyIssues] = useState<boolean>(user.notificationSettings?.nearbyIssues ?? true);
  const [badgeUnlock, setBadgeUnlock] = useState<boolean>(user.notificationSettings?.badgeUnlock ?? true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const toggleCategory = (cat: string) => {
    if (preferredCategories.includes(cat)) {
      setPreferredCategories(prev => prev.filter(c => c !== cat));
    } else {
      setPreferredCategories(prev => [...prev, cat]);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      preferredCategories,
      notificationSettings: {
        statusUpdates,
        nearbyIssues,
        badgeUnlock
      }
    };

    // Simulate saving to backend or calling parent
    onUpdatePreferences(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Left side: Avatar, Karma score and Unlocked Badges */}
      <div className="md:col-span-5 space-y-6">
        {/* Avatar Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-sky-50 shadow-inner">
            <img
              referrerPolicy="no-referrer"
              src={user.profilePicture}
              alt={user.name}
              className="w-full h-full object-cover"
            />
            {user.streakDays > 0 && (
              <div className="absolute bottom-0 right-0 bg-orange-500 text-white p-1 rounded-full border-2 border-white flex items-center justify-center shadow animate-bounce" title={`${user.streakDays} Day Active Streak`}>
                <Flame size={12} className="fill-current" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">{user.name}</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-mono mt-1 inline-block uppercase tracking-wider">{user.role} Member</span>
          </div>

          {/* Karma point KPI */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-4 grid grid-cols-2 gap-2 text-center divide-x divide-sky-100">
            <div>
              <div className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider">Karma Reputation</div>
              <div className="text-xl font-bold font-display text-sky-800 mt-0.5">{user.karma}</div>
            </div>
            <div>
              <div className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider">Active Streak</div>
              <div className="text-xl font-bold font-display text-orange-600 mt-0.5 flex items-center justify-center gap-1">
                <Flame size={16} className="fill-current" /> {user.streakDays} Days
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px] text-slate-500 border-t border-slate-50 pt-4">
            <div>
              <div className="font-bold text-slate-800 text-sm">{user.reportCount || 0}</div>
              <div>Reported</div>
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">{user.verificationCount || 0}</div>
              <div>Verified</div>
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm">{user.resolvedCount || 0}</div>
              <div>Resolved</div>
            </div>
          </div>
        </div>

        {/* Unlocked Badges */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider">Unlocked Achievements ({user.badges.length})</h4>
            <p className="text-slate-400 text-[11px] leading-tight mt-0.5">Your civic contributions recorded in the Hero hall.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {BADGE_TEMPLATES.map((b) => {
              const isUnlocked = user.badges.includes(b.id);
              const Icon = b.icon;

              return (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center space-y-1.5 transition-all ${
                    isUnlocked
                      ? "bg-slate-50/50 border-slate-100 shadow-sm opacity-100"
                      : "bg-slate-100/30 border-slate-100 opacity-40 line-through select-none"
                  }`}
                >
                  <div className={`p-2 rounded-xl text-white ${
                    isUnlocked ? `bg-gradient-to-tr ${b.color} shadow-sm scale-110` : "bg-slate-300"
                  }`}>
                    <Icon size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800 text-[10px] leading-none">{b.name}</div>
                    <span className="text-slate-400 text-[8px] leading-none block">{b.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right side: Categories preferences & Notification Settings Form */}
      <form onSubmit={handleSavePreferences} className="md:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 flex flex-col h-full">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-sm">Personalize Civic Hub settings</h3>
          <p className="text-slate-500 text-xs">Set favorite problem monitoring wards, categories, and push channels.</p>
        </div>

        {/* Categories toggler */}
        <div className="space-y-3">
          <label className="block text-slate-700 text-xs font-semibold flex items-center gap-1.5">
            <Bookmark size={14} className="text-slate-400" />
            Subscribed Problem Channels (Preferred Monitoring)
          </label>
          <div className="flex flex-wrap gap-2">
            {["Pothole", "Water Leakage", "Streetlight", "Waste", "Traffic", "Other"].map((cat) => {
              const active = preferredCategories.includes(cat);

              return (
                <button
                  id={`cat-pref-btn-${cat.replace(" ", "-")}`}
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? "bg-sky-50 border-sky-300 text-sky-700 ring-2 ring-sky-500/10"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {active && <span className="inline-block mr-1">✓</span>}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications toggle row */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <label className="block text-slate-700 text-xs font-semibold flex items-center gap-1.5">
            <Bell size={14} className="text-slate-400" />
            Civic Alert Delivery channels
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="text-xs">
                <div className="font-semibold text-slate-800">Status Update Alerts</div>
                <div className="text-slate-400 text-[10px] mt-0.5">Direct push/email updates on reported issue resolutions.</div>
              </div>
              <input
                id="pref-notif-status"
                type="checkbox"
                checked={statusUpdates}
                onChange={(e) => setStatusUpdates(e.target.checked)}
                className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="text-xs">
                <div className="font-semibold text-slate-800">Nearby Issue Discovery</div>
                <div className="text-slate-400 text-[10px] mt-0.5">Alerts for new issues within 500m of your neighborhood coordinates.</div>
              </div>
              <input
                id="pref-notif-nearby"
                type="checkbox"
                checked={nearbyIssues}
                onChange={(e) => setNearbyIssues(e.target.checked)}
                className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="text-xs">
                <div className="font-semibold text-slate-800">Milestone Achievement Alerts</div>
                <div className="text-slate-400 text-[10px] mt-0.5">Notification toast alerts on badge unlocks or global leaderboard climbs.</div>
              </div>
              <input
                id="pref-notif-badge"
                type="checkbox"
                checked={badgeUnlock}
                onChange={(e) => setBadgeUnlock(e.target.checked)}
                className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
          <span className="text-[10px] text-slate-400 font-mono">Last Sync: {new Date(user.lastActivityAt).toLocaleTimeString()}</span>

          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1 animate-fade-in">
                <Check size={14} /> Preferences Saved!
              </span>
            )}
            <button
              id="save-preferences-btn"
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
