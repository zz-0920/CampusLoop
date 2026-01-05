import type { Context } from "koa";
import prisma from "../utils/prisma.js";

class DiscoverController {
  // Get users for matching (random or algorithm based)
  async getUsers(ctx: Context) {
    const userId = (ctx.state.user as { userId?: number })?.userId;

    try {
      // Simple random recommendation for now
      // In a real app, exclude followed users, and users already swiped
      const users = await prisma.user.findMany({
        where: userId ? { id: { not: userId } } : {},
        take: 10,
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          school: true,
          department: true,
          bio: true,
          isVerified: true,
        },
        orderBy: {
          // efficient random sampling is hard in SQL, for MVP just take first few or by created desc/asc
          createdAt: "desc",
        },
      });

      ctx.body = users;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get clubs list
  async getClubs(ctx: Context) {
    try {
      const clubs = await prisma.club.findMany({
        orderBy: { memberCount: "desc" },
      });
      ctx.body = clubs;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default new DiscoverController();
