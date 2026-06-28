/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Issue, User, DashboardMetrics, HotspotForecast, IssueSeverity, LocationInfo } from "./types";

const BASE_URL = ""; // Relative paths route to Express proxy

// Preset sample photos representing typical community issues for easy reporting
export const SAMPLE_CAMERA_PRESETS = [
  {
    id: "preset-pothole",
    name: "Street Pothole (Severe Cracks)",
    category: "Pothole",
    url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80",
    description: "Deep structural road collapse causing cars to swerve."
  },
  {
    id: "preset-leak",
    name: "Burst Water Main Line",
    category: "Water Leakage",
    url: "https://images.unsplash.com/photo-1542013936693-8848e5744430?auto=format&fit=crop&w=600&q=80",
    description: "High-pressure clean water spraying from public sidewalk joint."
  },
  {
    id: "preset-light",
    name: "Dark Highway Streetlight",
    category: "Streetlight",
    url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80",
    description: "Entire streetlamp column dead over blind pedestrian intersection."
  },
  {
    id: "preset-waste",
    name: "Illegal Wilderness Dump",
    category: "Waste",
    url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
    description: "Plastic chemical bins, industrial wood and rubbish piled on public grass."
  },
  {
    id: "preset-traffic",
    name: "Blocked Construction Lanes",
    category: "Traffic",
    url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80",
    description: "Abandoned safety barriers blocks standard bicycle lanes without warning markers."
  }
];

export async function loginUser(email: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    // If not found, automatically register for a seamless demo experience!
    return registerUser(email, email.split("@")[0]);
  }
  return res.json();
}

export async function registerUser(email: string, name: string, role = "Citizen"): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, role })
  });
  if (!res.ok) throw new Error("Registration failed.");
  return res.json();
}

export async function updateUserRole(userId: string, role: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/user/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, role })
  });
  if (!res.ok) throw new Error("Role update failed.");
  return res.json();
}

export async function getUserProfile(userId: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/user/profile/${userId}`);
  if (!res.ok) throw new Error("Profile retrieval failed.");
  return res.json();
}

export async function getIssues(filters: {
  category?: string;
  status?: string;
  severity?: string;
  ward?: string;
  search?: string;
} = {}): Promise<Issue[]> {
  const query = new URLSearchParams(filters as any).toString();
  const res = await fetch(`${BASE_URL}/api/issues?${query}`);
  if (!res.ok) throw new Error("Failed to fetch issues.");
  return res.json();
}

export async function getIssueById(id: string): Promise<Issue> {
  const res = await fetch(`${BASE_URL}/api/issues/${id}`);
  if (!res.ok) throw new Error("Failed to fetch issue details.");
  return res.json();
}

export async function analyzeIssueAI(description: string, imageBase64?: string, mimeType?: string) {
  const res = await fetch(`${BASE_URL}/api/issues/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, imageBase64, mimeType })
  });
  if (!res.ok) throw new Error("AI analysis failed.");
  return res.json();
}

export async function createIssue(data: {
  reporterId: string;
  title: string;
  description: string;
  categoryUser: string;
  categoryAI?: string;
  categoryConfidence?: number;
  severity: IssueSeverity;
  location: LocationInfo;
  imageUrl?: string;
  analysisData?: any;
}): Promise<Issue> {
  const res = await fetch(`${BASE_URL}/api/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to submit issue report.");
  return res.json();
}

export async function submitVerificationVote(issueId: string, userId: string, vote: "Verified" | "NotSure" | "Disputed"): Promise<Issue> {
  const res = await fetch(`${BASE_URL}/api/issues/${issueId}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, vote })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to submit verification vote.");
  }
  return res.json();
}

export async function updateIssueStatus(issueId: string, data: {
  authorityId: string;
  status: string;
  note?: string;
  resolutionImage?: string;
}): Promise<Issue> {
  const res = await fetch(`${BASE_URL}/api/issues/${issueId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update status.");
  return res.json();
}

export async function addComment(issueId: string, data: {
  userId: string;
  text: string;
  isAuthorityUpdate?: boolean;
}): Promise<Issue> {
  const res = await fetch(`${BASE_URL}/api/issues/${issueId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to post comment.");
  return res.json();
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${BASE_URL}/api/analytics/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch metrics.");
  return res.json();
}

export async function getHotspotPredictions(): Promise<HotspotForecast[]> {
  const res = await fetch(`${BASE_URL}/api/analytics/hotspots`);
  if (!res.ok) throw new Error("Failed to fetch hotspot predictions.");
  return res.json();
}

export async function getLeaderboard(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/api/leaderboard`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard.");
  return res.json();
}
