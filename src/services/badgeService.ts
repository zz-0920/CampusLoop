import request from "../utils/request";

export interface BadgeInfo {
  id: number;
  key: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  conditionType: string;
  conditionValue: number;
  isUnlocked: boolean;
  isDisplayed: boolean;
  unlockedAt: string | null;
  currentProgress: number;
}

export interface DisplayBadge {
  id: number;
  key: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: string;
  isDisplayed: boolean;
}

export interface CheckResult {
  newlyUnlocked: Array<{
    id: number;
    key: string;
    name: string;
    icon: string;
    description: string;
  }>;
  totalUnlocked: number;
}

export const getAllBadges = async (): Promise<BadgeInfo[]> => {
  return request.get("/badges") as unknown as Promise<BadgeInfo[]>;
};

export const checkAndUnlockBadges = async (): Promise<CheckResult> => {
  return request.post("/badges/check") as unknown as Promise<CheckResult>;
};

export const toggleBadgeDisplay = async (
  badgeId: number
): Promise<{ isDisplayed: boolean }> => {
  return request.post(
    `/badges/${badgeId}/toggle-display`
  ) as unknown as Promise<{ isDisplayed: boolean }>;
};

export const getDisplayBadges = async (
  userId: number
): Promise<DisplayBadge[]> => {
  return request.get(
    `/badges/display/${userId}`
  ) as unknown as Promise<DisplayBadge[]>;
};
