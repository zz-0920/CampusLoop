import type { Context } from "koa";
import prisma from "../utils/prisma.js";

class InteractionController {
  // Get interactions on current user's posts
  async getMyInteractions(ctx: Context) {
    const currentUserId = (ctx.state.user as { userId: number }).userId;
    const page = Number(ctx.query.page) || 1;
    const limit = Number(ctx.query.limit) || 20;
    const type = ctx.query.type as string | undefined;
    const skip = (page - 1) * limit;

    try {
      // Build where clause - find interactions on posts owned by current user
      const whereClause: {
        post: { userId: number };
        userId?: { not: number };
        type?: string;
      } = {
        post: { userId: currentUserId },
        userId: { not: currentUserId }, // Exclude self-interactions
      };

      if (type && ["like", "comment", "share", "bookmark"].includes(type)) {
        whereClause.type = type;
      }

      const interactions = await prisma.interaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              isVerified: true,
            },
          },
          post: {
            select: {
              id: true,
              content: true,
              image: true,
            },
          },
        },
      });

      const total = await prisma.interaction.count({
        where: whereClause,
      });

      ctx.body = {
        interactions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get interaction counts by type for current user
  async getMyInteractionCounts(ctx: Context) {
    const currentUserId = (ctx.state.user as { userId: number }).userId;

    try {
      const [likeCount, commentCount, shareCount] = await Promise.all([
        prisma.interaction.count({
          where: {
            post: { userId: currentUserId },
            userId: { not: currentUserId },
            type: "like",
          },
        }),
        prisma.interaction.count({
          where: {
            post: { userId: currentUserId },
            userId: { not: currentUserId },
            type: "comment",
          },
        }),
        prisma.interaction.count({
          where: {
            post: { userId: currentUserId },
            userId: { not: currentUserId },
            type: "share",
          },
        }),
      ]);

      ctx.body = {
        like: likeCount,
        comment: commentCount,
        share: shareCount,
        total: likeCount + commentCount + shareCount,
      };
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default new InteractionController();
