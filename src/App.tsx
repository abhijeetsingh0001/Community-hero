/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Map,
  MapPin,
  List,
  Activity,
  Trophy,
  User as UserIcon,
  Plus,
  Search,
  Sparkles,
  Shield,
  HelpCircle,
  RefreshCw,
  Cone,
  Droplet,
  Lightbulb,
  Trash2,
  Car,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle,
  Menu,
  Eye,
  Sliders,
  ChevronDown
} from "lucide-react";

import { Issue, User, IssueStatus } from "./types";
import {
  getIssues,
  loginUser,
  updateUserRole,
  getUserProfile,
  SAMPLE_CAMERA_PRESETS
} from "./api";

// Sub-components
import { MapView } from "./components/MapView";
import { ReportForm } from "./components/ReportForm";
import { IssueDetail } from "./components/IssueDetail";
import { Dashboard } from "./components/Dashboard";
import { Leaderboard } from "./components/Leaderboard";
import { UserProfile } from "./components/UserProfile";

// Available demo actors for instant testing
const ACTOR_PRESETS = [
  { name: "John Doe (Citizen)", email: "john@citizen.org", role: "Citizen" },
  { name: "Supervisor Vance (Municipal Authority)", email: "vance@municipal.gov", role: "Authority" },
  { name: "Jane Smith (Community Leader)", email: "jane@community.org", role: "Leader" }
];

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<"map" | "list" | "analytics" | "leaderboard" | "profile">("map");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showReportForm, setShowReportForm] = useState<boolean>(false);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [actorDropdownOpen, setActorDropdownOpen] = useState<boolean>(false);

  // Issue Lists & Filters state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState<boolean>(true);
  const [selectedWard, setSelectedWard] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Initialize and login default citizen
  useEffect(() => {
    handleLogin(ACTOR_PRESETS[0]);
  }, []);

  // Fetch issues whenever filters or selected tab changes
  const fetchIssuesList = async () => {
    setLoadingIssues(true);
    try {
      const filters: any = {};
      if (selectedWard !== "all") filters.ward = selectedWard;
      if (selectedCategory !== "all") filters.category = selectedCategory;
      if (selectedStatus !== "all") filters.status = selectedStatus;
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      const fetched = await getIssues(filters);
      setIssues(fetched);
    } catch (err) {
      console.error("Failed to fetch issues list:", err);
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    fetchIssuesList();
  }, [selectedWard, selectedCategory, selectedStatus]);

  // Login handler
  const handleLogin = async (actor: typeof ACTOR_PRESETS[0]) => {
    setIsLoggingIn(true);
    setAuthError("");
    try {
      const user = await loginUser(actor.email);
      // Ensure the backend role matches the selected actor role
      if (user.role !== actor.role) {
        const updated = await updateUserRole(user._id, actor.role);
        setCurrentUser(updated);
      } else {
        setCurrentUser(user);
      }
      setActorDropdownOpen(false);
    } catch (err: any) {
      setAuthError("Failed to switch actor: " + (err.message || "Unknown error"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const refreshCurrentUserProfile = async () => {
    if (!currentUser) return;
    try {
      const updated = await getUserProfile(currentUser._id);
      setCurrentUser(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Callback on submission success
  const handleReportSuccess = () => {
    setShowReportForm(false);
    setActiveTab("list");
    fetchIssuesList();
    refreshCurrentUserProfile();
  };

  // Helper icons for categorizations
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Pothole":
        return <Cone size={14} className="text-amber-500" />;
      case "Water Leakage":
        return <Droplet size={14} className="text-sky-500" />;
      case "Streetlight":
        return <Lightbulb size={14} className="text-yellow-500" />;
      case "Waste":
        return <Trash2 size={14} className="text-teal-600" />;
      case "Traffic":
        return <Car size={14} className="text-rose-500" />;
      default:
        return <ShieldAlert size={14} className="text-slate-500" />;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Submitted": return "bg-slate-100 text-slate-800 border-slate-200";
      case "VerificationPending": return "bg-yellow-50 text-yellow-800 border-yellow-200 animate-pulse";
      case "Verified": return "bg-green-50 text-green-800 border-green-200";
      case "Acknowledged": return "bg-sky-50 text-sky-800 border-sky-200";
      case "InProgress": return "bg-orange-50 text-orange-800 border-orange-200";
      case "Resolved": return "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold";
      default: return "bg-rose-50 text-rose-800 border-rose-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* 1. TOP HEADER / BRANDING & ROLE SWITCHER */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center font-display font-extrabold text-white text-base tracking-tighter shadow-lg shadow-sky-500/20">
              CH
            </div>
            <div>
              <h1 className="font-display font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                Community Hero <span className="bg-emerald-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-normal">AI Grounded</span>
              </h1>
              <p className="text-slate-400 text-[10px] leading-tight font-mono">HeroVille Municipal Hub & Citizen Co-op</p>
            </div>
          </div>

          {/* User Details & Active Role Swapping */}
          {currentUser ? (
            <div className="flex flex-wrap items-center gap-4">
              {/* Karma Tracker */}
              <div className="hidden lg:flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50 text-xs font-mono">
                <span className="text-sky-400">Karma Score:</span>
                <span className="font-bold text-slate-100">{currentUser.karma} K</span>
              </div>

              {/* Profile Details */}
              <div className="flex items-center gap-3 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-700/30">
                <img
                  referrerPolicy="no-referrer"
                  src={currentUser.profilePicture}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600"
                />

                <div className="text-left">
                  <div className="text-[11px] font-semibold text-slate-100 leading-none">{currentUser.name}</div>
                  <span className={`text-[8px] uppercase tracking-wider font-bold ${
                    currentUser.role === "Authority" ? "text-amber-400" : currentUser.role === "Leader" ? "text-indigo-400" : "text-slate-300"
                  }`}>
                    {currentUser.role} Account
                  </span>
                </div>

                {/* Dropdown Action Toggle for Actors swap */}
                <div className="relative">
                  <button
                    id="role-presets-dropdown-btn"
                    onClick={() => setActorDropdownOpen(!actorDropdownOpen)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
                    title="Swap Demo Personas"
                  >
                    <ChevronDown size={14} />
                  </button>

                  <AnimatePresence>
                    {actorDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 p-2 z-50 text-xs space-y-1"
                      >
                        <div className="px-2 py-1.5 text-slate-400 font-mono text-[9px] uppercase tracking-wider">Switch Testing Personas:</div>
                        {ACTOR_PRESETS.map((act) => (
                          <button
                            id={`actor-preset-${act.role.toLowerCase()}`}
                            key={act.email}
                            type="button"
                            onClick={() => handleLogin(act)}
                            disabled={isLoggingIn}
                            className={`w-full text-left p-2 rounded-lg transition-colors flex flex-col hover:bg-slate-50 ${
                              currentUser.role === act.role ? "bg-sky-50 font-semibold text-sky-700 border-l-4 border-sky-500" : ""
                            }`}
                          >
                            <span>{act.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono italic">{act.email}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 font-mono text-xs flex items-center gap-1.5">
              <RefreshCw className="animate-spin text-sky-500" size={14} /> Loading profiles...
            </div>
          )}
        </div>
      </header>

      {/* 2. NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-100 py-1.5 px-4 sticky top-[56px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-1">
            <button
              id="nav-tab-map"
              onClick={() => { setActiveTab("map"); setSelectedIssue(null); setShowReportForm(false); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "map" && !showReportForm
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Map size={14} /> Ward Map
            </button>
            <button
              id="nav-tab-list"
              onClick={() => { setActiveTab("list"); setSelectedIssue(null); setShowReportForm(false); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "list" && !showReportForm
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <List size={14} /> Issue Tracker
            </button>
            <button
              id="nav-tab-analytics"
              onClick={() => { setActiveTab("analytics"); setSelectedIssue(null); setShowReportForm(false); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "analytics" && !showReportForm
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Activity size={14} /> Impact Dashboard
            </button>
            <button
              id="nav-tab-leaderboard"
              onClick={() => { setActiveTab("leaderboard"); setSelectedIssue(null); setShowReportForm(false); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "leaderboard" && !showReportForm
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Trophy size={14} /> Leaderboard
            </button>
            <button
              id="nav-tab-profile"
              onClick={() => { setActiveTab("profile"); setSelectedIssue(null); setShowReportForm(false); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "profile" && !showReportForm
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <UserIcon size={14} /> My Profile
            </button>
          </div>

          {/* Quick Action Button "Report Issue" */}
          <button
            id="report-issue-trigger-btn"
            onClick={() => { setShowReportForm(true); setSelectedIssue(null); }}
            className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 shrink-0 shadow"
          >
            <Plus size={14} /> Report Failure
          </button>
        </div>
      </nav>

      {/* 3. MAIN WORKSPACE / CONTENT PANE */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {showReportForm ? (
            /* VIEW: SUBMIT NEW REPORT */
            <motion.div
              key="report-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <ReportForm
                userId={currentUser?._id || "usr-1"}
                onSubmissionSuccess={handleReportSuccess}
                onCancel={() => { setShowReportForm(false); setActiveTab("map"); }}
              />
            </motion.div>
          ) : selectedIssue ? (
            /* VIEW: INSPECT SPECIFIC ISSUE */
            <motion.div
              key="issue-detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <IssueDetail
                issue={selectedIssue}
                currentUser={currentUser || { _id: "usr-1", name: "Guest", email: "guest", role: "Citizen", karma: 0, streakDays: 0, badges: [], preferredCategories: [], lastActivityAt: "" }}
                onBack={() => setSelectedIssue(null)}
                onRefresh={(updated) => {
                  setSelectedIssue(updated);
                  // Refresh issue in pool
                  setIssues(prev => prev.map(i => i._id === updated._id ? updated : i));
                  refreshCurrentUserProfile();
                }}
              />
            </motion.div>
          ) : (
            /* TAB SWITCHING ROUTERS */
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeTab === "map" && (
                <div className="grid grid-cols-1 gap-6">
                  <MapView
                    issues={issues}
                    selectedWard={selectedWard}
                    onSelectWard={(ward) => setSelectedWard(ward)}
                    onSelectIssue={(issue) => setSelectedIssue(issue)}
                  />
                </div>
              )}

              {activeTab === "list" && (
                /* MAIN SEARCHABLE ISSUES LIST */
                <div className="space-y-6">
                  {/* Search and Filters Drawer */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                    {/* Search Field */}
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                      <input
                        id="list-search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          // Defer search execution
                        }}
                        placeholder="Search potholes, water mains, lighting..."
                        className="pl-8 pr-10 py-2 bg-slate-50/50 rounded-xl text-xs w-full outline-none focus:bg-white focus:ring-1 focus:ring-sky-500 border border-slate-200 focus:border-sky-500 text-slate-800 transition-all placeholder:text-slate-400 font-medium"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => { setSearchQuery(""); fetchIssuesList(); }}
                          className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Quick Filters Group */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                      {/* Ward filter select */}
                      <select
                        id="filter-ward"
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="all">🌍 All Wards</option>
                        <option value="Ward 4: Downtown Central">Ward 4: Downtown</option>
                        <option value="Ward 7: Lakeside Promenade">Ward 7: Lakeside</option>
                        <option value="Ward 9: Green Hills Residential">Ward 9: Green Hills</option>
                        <option value="Ward 2: Industrial Corridor">Ward 2: Industrial</option>
                      </select>

                      {/* Category filter select */}
                      <select
                        id="filter-category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="all">📂 All Categories</option>
                        <option value="Pothole">🚧 Potholes</option>
                        <option value="Water Leakage">💧 Water Leakage</option>
                        <option value="Streetlight">💡 Streetlights</option>
                        <option value="Waste">🗑️ Garbage/Waste</option>
                        <option value="Traffic">🚗 Traffic barriers</option>
                      </select>

                      {/* Status filter select */}
                      <select
                        id="filter-status"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="all">📋 All Statuses</option>
                        <option value="Submitted">Submitted</option>
                        <option value="VerificationPending">Verification Pending</option>
                        <option value="Verified">Verified</option>
                        <option value="Acknowledged">Acknowledged</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>

                      {/* Trigger query execution */}
                      <button
                        id="filter-search-submit-btn"
                        onClick={fetchIssuesList}
                        className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Reload Filter"
                      >
                        <RefreshCw size={14} className={loadingIssues ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* Grid layout of active issue cards */}
                  {loadingIssues ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <RefreshCw className="animate-spin text-sky-600 mb-2" size={24} />
                      <span className="text-slate-400 font-mono text-xs">Reloading local reports database...</span>
                    </div>
                  ) : issues.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center max-w-md mx-auto space-y-4">
                      <div className="p-4 bg-sky-50 text-sky-600 rounded-full w-12 h-12 mx-auto flex items-center justify-center font-bold">?</div>
                      <h4 className="font-display font-bold text-slate-900 text-sm">No reported issues found</h4>
                      <p className="text-slate-500 text-xs">Try relaxing your search query or ward settings, or log a fresh failure report to alert municipal crews!</p>
                      <button
                        id="empty-state-report-btn"
                        onClick={() => setShowReportForm(true)}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors inline-block"
                      >
                        Report Fresh Issue
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {issues.map((issue) => (
                        <div
                          id={`issue-card-${issue._id}`}
                          key={issue._id}
                          className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all overflow-hidden flex flex-col cursor-pointer group"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          {/* Card Media Header */}
                          <div className="relative aspect-[16/10] bg-slate-950">
                            {issue.images[0]?.url ? (
                              <img
                                referrerPolicy="no-referrer"
                                src={issue.images[0].url}
                                alt={issue.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-mono">No Image</div>
                            )}

                            {/* Overlay category tag */}
                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                              {getCategoryIcon(issue.categoryUser)}
                              <span className="text-[10px] font-semibold text-slate-800">{issue.categoryUser}</span>
                            </div>

                            {/* Validation indicators */}
                            {issue.status === "VerificationPending" && (
                              <div className="absolute top-3 right-3 bg-yellow-500 text-white font-mono text-[9px] font-extrabold px-2 py-1 rounded-lg shadow-sm animate-pulse flex items-center gap-1">
                                <Activity size={10} />
                                <span>Verifying ({issue.verificationStatus.verified}/3)</span>
                              </div>
                            )}
                          </div>

                          {/* Card Content body */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              {/* Severity and status badges row */}
                              <div className="flex items-center gap-1.5 text-[9px] font-mono">
                                <span className={`px-1.5 py-0.2 rounded border ${
                                  issue.severity === "Critical" ? "bg-rose-50 text-rose-700 border-rose-100 font-bold" : "text-slate-500 border-slate-100"
                                }`}>
                                  {issue.severity} Severity
                                </span>
                                <span className={`px-1.5 py-0.2 rounded-full border ${getStatusBadgeStyle(issue.status)}`}>
                                  {issue.status}
                                </span>
                              </div>

                              <h4 className="font-display font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-sky-600 transition-colors">{issue.title}</h4>
                              <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{issue.description}</p>
                            </div>

                            {/* Meta Location Footer */}
                            <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span className="flex items-center gap-1 truncate max-w-[130px]">
                                <MapPin size={11} className="text-sky-500" />
                                <span className="truncate">{issue.location.address}</span>
                              </span>
                              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "analytics" && <Dashboard />}

              {activeTab === "leaderboard" && <Leaderboard />}

              {activeTab === "profile" && currentUser && (
                <UserProfile
                  user={currentUser}
                  onUpdatePreferences={(updated) => {
                    setCurrentUser(updated);
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. SEAMLESS PUBLIC FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 px-4 mt-12 text-center text-xs font-mono">
        <div className="max-w-7xl mx-auto space-y-2">
          <p>Community Hero © {new Date().getFullYear()} — Empowering civic stewardship with crowdsourced validation.</p>
          <p className="text-[10px] text-slate-600">Built in partnership with HeroVille Municipal Works & Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}
