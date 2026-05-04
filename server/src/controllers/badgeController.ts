import type { Context } from "koa";
import prisma from "../utils/prisma.js";

// Predefined badges to seed if not present
const PREDEFINED_BADGES = [
  { key: "first_post", name: "初来乍到", icon: "✨", description: "发布第一条帖子", category: "content", conditionType: "post_count", conditionValue: 1 },
  { key: "content_creator", name: "创作达人", icon: "📝", description: "发布10条帖子", category: "content", conditionType: "post_count", conditionValue: 10 },
  { key: "prolific_writer", name: "笔耕不辍", icon: "✍️", description: "发布50条帖子", category: "content", conditionType: "post_count", conditionValue: 50 },
  { key: "first_follower", name: "魅力初现", icon: "💫", description: "获得第一个粉丝", category: "social", conditionType: "follower_count", conditionValue: 1 },
  { key: "social_butterfly", name: "社牛达人", icon: "🤝", description: "获得10个粉丝", category: "social", conditionType: "follower_count", conditionValue: 10 },
  { key: "campus_star", name: "校园之星", icon: "⭐", description: "获得50个粉丝", category: "social", conditionType: "follower_count", conditionValue: 50 },
  { key: "liked_one", name: "初获赞赏", icon: "👍", description: "获得第一个点赞", category: "social", conditionType: "like_count", conditionValue: 1 },
  { key: "popular", name: "人气之选", icon: "🔥", description: "获得50个点赞", category: "social", conditionType: "like_count", conditionValue: 50 },
  { key: "commentator", name: "评论达人", icon: "💬", description: "发表10条评论", category: "content", conditionType: "comment_count", conditionValue: 10 },
  { key: "early_bird", name: "早起达人", icon: "🌅", description: "注册满30天", category: "achievement", conditionType: "account_age_days", conditionValue: 30 },
  { key: "veteran", name: "校园元老", icon: "🏆", description: "注册满180天", category: "achievement", conditionType: "account_age_days", conditionValue: 180 },
  { key: "club_founder", name: "社团创始人", icon: "🏛️", description: "创建一个社团", category: "achievement", conditionType: "club_count", conditionValue: 1 },
];

// Ensure all predefined badges exist in DB
async function ensureBadgesSeeded() {
  const existingCount = await prisma.badge.count();
  if (existingCount >= PREDEFINED_BADGES.length) return;

  for (const badge of PREDEFINED_BADGES) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {},
      create: badge,
    });
  }
}

// Get user's current stats for condition checking
async function getUserStats(userId: number) {
  const [postCount, followerCount, likeCount, commentCount, clubCount, user] =
    await Promise.all([
      prisma.post.count({ where: { userId } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.interaction.count({
        where: {
          type: "like",
          post: { userId },
        },
      }),
      prisma.interaction.count({
        where: { userId, type: "comment" },
      }),
      prisma.club.count({ where: { ownerId: userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
    ]);

  const accountAgeDays = user
    ? Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return {
    post_count: postCount,
    follower_count: followerCount,
    like_count: likeCount,
    comment_count: commentCount,
    club_count: clubCount,
    account_age_days: accountAgeDays,
  };
}

class BadgeController {
  // GET /api/badges - Get all badges with user's unlock status
  async getAllBadges(ctx: Context) {
    const userId = (ctx.state.user as { userId: number }).userId;

    try {
      await ensureBadgesSeeded();

      const badges = await prisma.badge.findMany({
        orderBy: { id: "asc" },
        include: {
          userBadges: {
            where: { userId },
          },
        },
      });

      const stats = await getUserStats(userId);

      const result = badges.map((badge) => {
        const userBadge = badge.userBadges[0];
        const currentValue = stats[badge.conditionType as keyof typeof stats] || 0;

        return {
          id: badge.id,
          key: badge.key,
          name: badge.name,
          icon: badge.icon,
          description: badge.description,
          category: badge.category,
          conditionType: badge.conditionType,
          conditionValue: badge.conditionValue,
          isUnlocked: !!userBadge,
          isDisplayed: userBadge?.isDisplayed || false,
          unlockedAt: userBadge?.unlockedAt || null,
          currentProgress: currentValue,
        };
      });

      ctx.body = result;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Failed to fetch badges",
      };
    }
  }

  // POST /api/badges/check - Check and auto-unlock eligible badges
  async checkAndUnlock(ctx: Context) {
    const userId = (ctx.state.user as { userId: number }).userId;

    try {
      await ensureBadgesSeeded();

      const stats = await getUserStats(userId);

      // Get all badges that user hasn't unlocked yet
      const allBadges = await prisma.badge.findMany();
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true },
      });
      const unlockedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

      const newlyUnlocked: Array<{
        id: number;
        key: string;
        name: string;
        icon: string;
        description: string;
      }> = [];

      for (const badge of allBadges) {
        if (unlockedBadgeIds.has(badge.id)) continue;

        const currentValue =
          stats[badge.conditionType as keyof typeof stats] || 0;

        if (currentValue >= badge.conditionValue) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
              isDisplayed: false,
            },
          });
          newlyUnlocked.push({
            id: badge.id,
            key: badge.key,
            name: badge.name,
            icon: badge.icon,
            description: badge.description,
          });
        }
      }

      ctx.body = {
        newlyUnlocked,
        totalUnlocked: unlockedBadgeIds.size + newlyUnlocked.length,
      };
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error:
          error instanceof Error ? error.message : "Failed to check badges",
      };
    }
  }

  // POST /api/badges/:id/toggle-display - Toggle display status
  async toggleDisplay(ctx: Context) {
    const userId = (ctx.state.user as { userId: number }).userId;
    const badgeId = Number(ctx.params.id);

    try {
      const userBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId,
          },
        },
      });

      if (!userBadge) {
        ctx.status = 404;
        ctx.body = { error: "Badge not unlocked" };
        return;
      }

      const updated = await prisma.userBadge.update({
        where: { id: userBadge.id },
        data: { isDisplayed: !userBadge.isDisplayed },
      });

      ctx.body = {
        isDisplayed: updated.isDisplayed,
      };
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle badge display",
      };
    }
  }

  // GET /api/badges/display/:userId - Get user's displayed badges
  async getDisplayBadges(ctx: Context) {
    const userId = Number(ctx.params.userId);

    try {
      await ensureBadgesSeeded();

      const displayedBadges = await prisma.userBadge.findMany({
        where: {
          userId,
          isDisplayed: true,
        },
        include: {
          badge: true,
        },
        orderBy: {
          unlockedAt: "asc",
        },
      });

      // If user hasn't selected any, show all unlocked (up to 8)
      if (displayedBadges.length === 0) {
        const allUnlocked = await prisma.userBadge.findMany({
          where: { userId },
          include: { badge: true },
          orderBy: { unlockedAt: "asc" },
          take: 8,
        });

        ctx.body = allUnlocked.map((ub) => ({
          id: ub.badge.id,
          key: ub.badge.key,
          name: ub.badge.name,
          icon: ub.badge.icon,
          description: ub.badge.description,
          unlockedAt: ub.unlockedAt,
          isDisplayed: ub.isDisplayed,
        }));
        return;
      }

      ctx.body = displayedBadges.map((ub) => ({
        id: ub.badge.id,
        key: ub.badge.key,
        name: ub.badge.name,
        icon: ub.badge.icon,
        description: ub.badge.description,
        unlockedAt: ub.unlockedAt,
        isDisplayed: ub.isDisplayed,
      }));
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch display badges",
      };
    }
  }
}

export default new BadgeController();
