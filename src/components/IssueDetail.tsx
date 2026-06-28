/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Issue, User, IssueStatus } from "../types";
import {
  submitVerificationVote,
  updateIssueStatus,
  addComment
} from "../api";
import {
  MapPin,
  Calendar,
  User as UserIcon,
  ShieldAlert,
  Flame,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink,
  PlusCircle,
  Activity,
  AlertCircle,
  ThumbsUp,
  Award,
  ChevronRight,
  RefreshCw,
  EyeOff
} from "lucide-react";

interface IssueDetailProps {
  issue: Issue;
  currentUser: User;
  onBack: () => void;
  onRefresh: (updatedIssue: Issue) => void;
}

export function IssueDetail({ issue, currentUser, onBack, onRefresh }: IssueDetailProps) {
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  // Authority actions
  const [authorityNote, setAuthorityNote] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusError, setStatusError] = useState<string>("");

  const isReporter = issue.reporterId === currentUser._id;
  const isAuthority = currentUser.role === "Authority" || currentUser.role === "Admin" || currentUser.role === "Leader";

  const hasAlreadyVoted = issue.verificationVotes.some(v => v.userId === currentUser._id);

  // Handle verification vote
  const handleVote = async (voteType: "Verified" | "NotSure" | "Disputed") => {
    if (hasAlreadyVoted) return;
    try {
      const updated = await submitVerificationVote(issue._id, currentUser._id, voteType);
      onRefresh(updated);
    } catch (err: any) {
      alert(err.message || "Failed to submit verification vote.");
    }
  };

  // Handle status update (Authorities Only)
  const handleStatusChange = async (nextStatus: IssueStatus) => {
    setIsUpdatingStatus(true);
    setStatusError("");

    let simulatedResolutionImage = undefined;
    if (nextStatus === "Resolved") {
      // Pick a clean, resolved equivalent image based on category
      if (issue.categoryUser === "Pothole") {
        simulatedResolutionImage = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"; // smooth clean paved road
      } else if (issue.categoryUser === "Streetlight") {
        simulatedResolutionImage = "https://images.unsplash.com/photo-1517457373958-b705863391b1?auto=format&fit=crop&w=600&q=80"; // bright glowing streetlight
      } else {
        simulatedResolutionImage = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"; // clean public space
      }
    }

    try {
      const updated = await updateIssueStatus(issue._id, {
        authorityId: currentUser._id,
        status: nextStatus,
        note: authorityNote || `Status updated to ${nextStatus} by Municipal Works.`,
        resolutionImage: simulatedResolutionImage
      });
      onRefresh(updated);
      setAuthorityNote("");
    } catch (err: any) {
      setStatusError(err.message || "Status update failed.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const isOfficialUpdate = isAuthority;
      const updated = await addComment(issue._id, {
        userId: currentUser._id,
        text: commentText,
        isAuthorityUpdate: isOfficialUpdate
      });
      onRefresh(updated);
      setCommentText("");
    } catch (err) {
      alert("Failed to submit comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Status style helpers
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-rose-100 text-rose-800 border-rose-200 font-bold";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
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

  // Pipeline transitions horizontal rendering
  const timelineStages: { status: IssueStatus; label: string }[] = [
    { status: "Submitted", label: "Submitted" },
    { status: "Verified", label: "Verified" },
    { status: "Acknowledged", label: "Acknowledged" },
    { status: "InProgress", label: "In Progress" },
    { status: "Resolved", label: "Resolved" }
  ];

  const currentStageIndex = timelineStages.findIndex(s => s.status === issue.status);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl mx-auto">
      {/* Detail Header Banner */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-slate-800 text-xs font-semibold flex items-center gap-1 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
        >
          ← Back to Hub
        </button>
        <span className="text-slate-400 font-mono text-[10px]">REPORT ID: {issue._id}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* Left Side: Images, Timeline, and Verification voting */}
        <div className="md:col-span-7 p-6 border-r border-slate-100 space-y-6">
          {/* Before/After Gallery or single image */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-sm">
            {issue.status === "Resolved" && issue.resolutionImages && issue.resolutionImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-0.5">
                <div className="relative aspect-[4/3] bg-slate-950">
                  <img
                    referrerPolicy="no-referrer"
                    src={issue.images[0]?.url}
                    alt="Before repair"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-rose-600/90 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Before (Reported)</div>
                </div>
                <div className="relative aspect-[4/3] bg-slate-950">
                  <img
                    referrerPolicy="no-referrer"
                    src={issue.resolutionImages[0]}
                    alt="After repair"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600/90 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">After (Fixed!)</div>
                </div>
              </div>
            ) : (
              <div className="relative aspect-[16/10] bg-slate-950 flex items-center justify-center">
                {issue.images[0]?.url ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={issue.images[0].url}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-500 font-mono text-xs flex flex-col items-center gap-1">
                    <EyeOff size={24} /> No Image Attached
                  </div>
                )}
                {issue.images[0]?.analysisData && (
                  <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-white font-mono text-[9px] flex items-center gap-1.5 animate-pulse">
                    <Sparkles size={11} className="text-amber-400" />
                    <span>Vision AI Certified</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Issue Core Details */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${getSeverityBadgeColor(issue.severity)}`}>
                {issue.severity} Severity
              </span>
              <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${getStatusBadgeStyle(issue.status)}`}>
                {issue.status}
              </span>
              <span className="bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-0.5 text-[10px] font-semibold rounded-full">
                {issue.categoryUser}
              </span>
            </div>

            <h1 className="font-display font-bold text-slate-900 text-xl mb-2">{issue.title}</h1>

            <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
              &ldquo;{issue.description}&rdquo;
            </p>
          </div>

          {/* Geo references */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs text-slate-700 font-mono">
            <div className="flex items-start gap-2">
              <MapPin className="text-sky-600 shrink-0 mt-0.5" size={14} />
              <div>
                <div className="font-semibold text-slate-900">Reported Location</div>
                <div className="text-slate-500 text-[11px] leading-tight mt-0.5">{issue.location.address}</div>
                {issue.location.landmark && (
                  <div className="text-sky-700 text-[10px] mt-1">Landmark: {issue.location.landmark}</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="text-slate-500 shrink-0 mt-0.5" size={14} />
              <div>
                <div className="font-semibold text-slate-900">Timeline Logging</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Submitted: {new Date(issue.createdAt).toLocaleDateString()}</div>
                <div className="text-slate-500 text-[11px]">Updated: {new Date(issue.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Verification Voting Module (Visible if status is VerificationPending or Submitted) */}
          {issue.status === "VerificationPending" && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-100 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div className="text-xs">
                  <h3 className="font-semibold text-slate-900">Crowdsourced Community Validation</h3>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Before city dispatch teams can commit municipal resources, the community must verify this problem.
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Agreement Progress: {issue.verificationStatus.verified} / 3 Votes</span>
                  <span className="font-bold text-slate-800">{issue.verificationStatus.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{ width: `${issue.verificationStatus.percentage}%` }}
                  />
                </div>
              </div>

              {/* Vote controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {hasAlreadyVoted ? (
                  <div className="bg-white/80 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-800 text-center w-full font-semibold">
                    ✓ You have successfully logged your verification vote. Thank you for participating!
                  </div>
                ) : isReporter ? (
                  <div className="text-slate-400 text-[10px] italic">
                    As the reporter, you cannot cast a validation vote.
                  </div>
                ) : (
                  <>
                    <span className="text-[10px] font-semibold text-slate-500">Cast your assessment:</span>
                    <div className="flex gap-2">
                      <button
                        id="verify-vote-btn"
                        onClick={() => handleVote("Verified")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        ✓ Legitimate (+10 Karma)
                      </button>
                      <button
                        id="notsure-vote-btn"
                        onClick={() => handleVote("NotSure")}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-[10px] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Unsure
                      </button>
                      <button
                        id="dispute-vote-btn"
                        onClick={() => handleVote("Disputed")}
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium text-[10px] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Dispute / Fake
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Timeline steps, Authority controls, Comments */}
        <div className="md:col-span-5 p-6 bg-slate-50/50 flex flex-col h-full space-y-6">
          {/* Horizontal/Vertical Pipeline Timeline */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-800 text-xs uppercase tracking-wider">Resolution Pipeline Journey</h3>

            <div className="relative pl-5 border-l-2 border-slate-200 space-y-4 font-sans text-xs">
              {issue.statusHistory.map((step, idx) => {
                const isLast = idx === issue.statusHistory.length - 1;

                return (
                  <div key={idx} className="relative">
                    {/* Ring */}
                    <div className={`absolute -left-[27px] top-0.5 w-3 h-3 rounded-full border-2 bg-white ${
                      isLast ? "border-sky-500 scale-125 ring-4 ring-sky-500/10" : "border-slate-300"
                    }`} />

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isLast ? "text-slate-900" : "text-slate-500"}`}>{step.status}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{new Date(step.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">By: {step.changedByName}</div>
                      {step.note && (
                        <p className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-100 mt-1 leading-relaxed">
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Municipal Authority Operations Console (Visible only to Authority roles) */}
          {isAuthority && (
            <div className="bg-sky-950 text-white rounded-2xl p-4 border border-sky-900 space-y-3 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300 border-b border-sky-900 pb-2">
                <Activity size={14} />
                <span>Municipal Work Order Management</span>
              </div>

              {/* Authority commands buttons */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {issue.status === "Verified" && (
                  <button
                    id="auth-acknowledge-btn"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange("Acknowledged")}
                    className="col-span-2 bg-sky-600 hover:bg-sky-500 p-2 rounded-xl text-center font-bold text-white transition-colors"
                  >
                    Acknowledge Ticket
                  </button>
                )}

                {issue.status === "Acknowledged" && (
                  <button
                    id="auth-inprogress-btn"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange("InProgress")}
                    className="col-span-2 bg-orange-600 hover:bg-orange-500 p-2 rounded-xl text-center font-bold text-white transition-colors"
                  >
                    Dispatch Repair Crew
                  </button>
                )}

                {issue.status === "InProgress" && (
                  <button
                    id="auth-resolve-btn"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange("Resolved")}
                    className="col-span-2 bg-emerald-600 hover:bg-emerald-500 p-2 rounded-xl text-center font-bold text-white transition-colors"
                  >
                    Mark Resolved (Attach Fix Evidence)
                  </button>
                )}
              </div>

              {/* Quick dispatch note */}
              <div>
                <input
                  id="authority-note-input"
                  type="text"
                  value={authorityNote}
                  onChange={(e) => setAuthorityNote(e.target.value)}
                  placeholder="Attach official dispatch note / crew details..."
                  className="w-full bg-sky-900/50 border border-sky-800 rounded-lg p-2 text-[11px] text-white outline-none placeholder:text-sky-300"
                />
              </div>

              {statusError && (
                <div className="text-rose-400 text-[10px] flex items-center gap-1">
                  <AlertCircle size={10} />
                  <span>{statusError}</span>
                </div>
              )}
            </div>
          )}

          {/* Comments stream & Discussion */}
          <div className="border-t border-slate-200/60 pt-4 flex-1 flex flex-col min-h-[220px]">
            <h3 className="font-display font-semibold text-slate-800 text-xs mb-3 flex items-center gap-1">
              <MessageSquare size={13} /> Discussions ({issue.comments.length})
            </h3>

            {/* List */}
            <div className="space-y-3 overflow-y-auto max-h-[250px] mb-4 flex-1 pr-1">
              {issue.comments.length === 0 ? (
                <div className="text-slate-400 text-[11px] italic text-center py-6">
                  No comments posted yet. Start the coordination!
                </div>
              ) : (
                issue.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-xl text-xs border ${
                      comment.isAuthorityUpdate
                        ? "bg-sky-50/80 border-sky-100 text-sky-900"
                        : "bg-white border-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        {comment.userName}
                        {comment.isAuthorityUpdate && (
                          <span className="bg-sky-600 text-white text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                            OFFICIAL
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="leading-relaxed text-slate-600 text-[11px]">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post comment form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-1.5 mt-auto">
              <input
                id="comment-input-field"
                type="text"
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isAuthority ? "Post official update..." : "Post community coordination message..."}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-sky-500 outline-none bg-white placeholder:text-slate-400"
              />
              <button
                id="post-comment-btn"
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white p-2.5 rounded-xl transition-colors shrink-0"
              >
                {isSubmittingComment ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
