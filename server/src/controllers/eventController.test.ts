import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import prisma from "../utils/prisma.js";
import jwt from "jsonwebtoken";

vi.mock("../utils/prisma.js", () => ({
  default: {
    event: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    club: {
      findFirst: vi.fn(),
    },
  },
}));

describe("EventController", () => {
  const token = jwt.sign({ userId: 1, username: "testuser" }, process.env.JWT_SECRET || "secret");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/events", () => {
    it("should create a new event if user owns the club", async () => {
      const eventData = {
        title: "Test Event",
        date: "Tomorrow",
        location: "Library",
        description: "Test Description",
        clubId: 1
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(prisma.club.findFirst).mockResolvedValue({ id: 1, ownerId: 1 } as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(prisma.event.create).mockResolvedValue({ id: 1, ...eventData, ownerId: 1 } as any);

      const response = await request(app.callback())
        .post("/api/events")
        .set("Authorization", `Bearer ${token}`)
        .send(eventData);

      expect(response.status).toBe(201);
      expect(prisma.event.create).toHaveBeenCalled();
    });

    it("should return 403 if user does not own the club", async () => {
      vi.mocked(prisma.club.findFirst).mockResolvedValue(null);

      const response = await request(app.callback())
        .post("/api/events")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Test", date: "Now", location: "Here", clubId: 1 });

      expect(response.status).toBe(403);
    });
  });

  describe("GET /api/events", () => {
    it("should return all events", async () => {
      vi.mocked(prisma.event.findMany).mockResolvedValue([]);

      const response = await request(app.callback()).get("/api/events");

      expect(response.status).toBe(200);
      expect(prisma.event.findMany).toHaveBeenCalled();
    });
  });
});
