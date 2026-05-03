import type { Context } from "koa";
import prisma from "../utils/prisma.js";

class ClubController {
  async create(ctx: Context) {
    const { name, description, logo } = ctx.request.body as {
      name: string;
      description?: string;
      logo?: string;
    };
    const userId = (ctx.state.user as { userId: number }).userId;

    if (!name?.trim()) {
      ctx.status = 400;
      ctx.body = { error: "Club name is required" };
      return;
    }

    try {
      const club = await prisma.club.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          logo: logo || null,
          ownerId: userId,
          memberCount: 1, // Creator is the first member
        },
      });

      ctx.status = 201;
      ctx.body = club;
    } catch (error: unknown) {
      console.error("Create club error:", error);
      ctx.status = 500;
      ctx.body = { error: "Failed to create club" };
    }
  }

  async getById(ctx: Context) {
    const { id } = ctx.params;
    try {
      const club = await prisma.club.findUnique({
        where: { id: Number(id) }
      });
      if (!club) {
        ctx.status = 404;
        ctx.body = { error: "Club not found" };
        return;
      }
      ctx.body = club;
    } catch {
      ctx.status = 500;
      ctx.body = { error: "Failed to fetch club" };
    }
  }
}

export default new ClubController();
