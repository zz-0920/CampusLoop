import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import prisma from "../utils/prisma.js";
import jwt from "jsonwebtoken";

vi.mock("../utils/prisma.js", () => ({
  default: {
    post: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe("PostController", () => {
  const token = jwt.sign({ userId: 1, username: "testuser" }, process.env.JWT_SECRET || "secret");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRandomPaperPlane", () => {
    it("should return a random paper plane post from the last 24 hours", async () => {
      const mockPosts = [{ id: 101 }, { id: 102 }];
      const mockPostDetail = {
        id: 101,
        content: "Hello from a paper plane!",
        createdAt: new Date().toISOString(),
      };

      vi.mocked(prisma.post.findMany).mockResolvedValue(mockPosts as any);
      vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPostDetail as any);

      const response = await request(app.callback())
        .get("/api/posts/random-paper-plane")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPostDetail);
      expect(prisma.post.findMany).toHaveBeenCalled();
      expect(prisma.post.findUnique).toHaveBeenCalled();
    });

    it("should return null if no eligible posts found", async () => {
      vi.mocked(prisma.post.findMany).mockResolvedValue([]);

      const response = await request(app.callback())
        .get("/api/posts/random-paper-plane")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);
    });
  });
});
