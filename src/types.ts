/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Citizen' | 'Authority' | 'Leader' | 'Admin';

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueStatus =
  | 'Submitted'
  | 'VerificationPending'
  | 'Verified'
  | 'Acknowledged'
  | 'InProgress'
  | 'Resolved'
  | 'Rejected';

export type VoteType = 'Verified' | 'NotSure' | 'Disputed';

export interface LocationInfo {
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  ward: string;
  landmark?: string;
}

export interface ImageRecord {
  url: string;
  uploadedAt: string;
  analysisData?: {
    labels: string[];
    confidence: number;
    severityScore: number; // 0-100
    detectedIssueType?: string;
    damageEstimation?: string;
  };
}

export interface StatusTransition {
  status: IssueStatus;
  changedBy: string;
  changedByName: string;
  timestamp: string;
  note?: string;
}

export interface VerificationVote {
  userId: string;
  userName: string;
  vote: VoteType;
  timestamp: string;
}

export interface VerificationSummary {
  verified: number;
  notSure: number;
  disputed: number;
  percentage: number;
}

export interface CommentRecord {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  helpful: number;
  isAuthorityUpdate: boolean;
}

export interface Issue {
  _id: string;
  reporterId: string;
  reporterName: string;
  title: string;
  description: string;
  categoryAI: string;
  categoryUser: string;
  categoryConfidence: number; // 0-100
  severity: IssueSeverity;
  location: LocationInfo;
  images: ImageRecord[];
  status: IssueStatus;
  statusHistory: StatusTransition[];
  verificationVotes: VerificationVote[];
  verificationStatus: VerificationSummary;
  assignedAuthority?: string;
  assignedAuthorityName?: string;
  estimatedResolutionDate?: string;
  actualResolutionDate?: string;
  resolutionImages?: string[];
  comments: CommentRecord[];
  karmaRewards?: {
    reporterReward: number;
    verifierRewards: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  profilePicture: string;
  role: UserRole;
  karma: number;
  leaderboardRank?: number;
  badges: string[];
  reportCount: number;
  verificationCount: number;
  resolvedCount: number;
  streakDays: number;
  preferredCategories: string[];
  notificationSettings: {
    statusUpdates: boolean;
    nearbyIssues: boolean;
    badgeUnlock: boolean;
  };
  registeredAt: string;
  lastActivityAt: string;
  isVerified: boolean;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Reporter' | 'Verifier' | 'Resolver' | 'Streak' | 'General';
  color: string;
}

export interface DashboardMetrics {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  activeCitizens: number;
  totalKarmaPoints: number;
  categoryBreakdown: { name: string; value: number }[];
  severityBreakdown: { name: string; value: number }[];
  statusBreakdown: { name: string; value: number }[];
  weeklyTrend: { date: string; reported: number; resolved: number }[];
  wardBreakdown: { name: string; count: number; resolved: number }[];
}

export interface HotspotForecast {
  ward: string;
  predictedCount: number;
  riskScore: number; // 0-100
  dominantCategory: string;
  confidence: number; // 0-100
  reasoning: string;
}
