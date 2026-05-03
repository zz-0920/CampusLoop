import type { Context } from "koa";
import prisma from "../utils/prisma.js";

class EventController {
  async create(ctx: Context) {
    const { title, date, location, description, image, clubId } = ctx.request.body as any;
    const userId = (ctx.state.user as { userId: number }).userId;

    if (!title || !date || !location || !clubId) {
      ctx.status = 400;
      ctx.body = { error: "Missing required fields" };
      return;
    }

    try {
      // Verify user owns the club
      const club = await prisma.club.findFirst({
        where: { id: Number(clubId), ownerId: userId }
      });

      if (!club) {
        ctx.status = 403;
        ctx.body = { error: "You are not the owner of this club" };
        return;
      }

      const event = await prisma.event.create({
        data: {
          title,
          date,
          location,
          description: description || null,
          image: image || null,
          clubId: Number(clubId),
          ownerId: userId
        }
      });

      ctx.status = 201;
      ctx.body = event;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = { error: error instanceof Error ? error.message : "Failed to create event" };
    }
  }

  async getAll(ctx: Context) {
    try {
      const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          club: { select: { name: true, logo: true } }
        }
      });
      ctx.body = events;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = { error: error instanceof Error ? error.message : "Failed to fetch events" };
    }
  }
}

export default new EventController();
