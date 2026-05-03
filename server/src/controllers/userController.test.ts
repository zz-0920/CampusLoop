import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import prisma from "../utils/prisma.js";
import jwt from "jsonwebtoken";

vi.mock("../utils/prisma.js", () => ({
  default: {
    club: {
      findMany: vi.fn(),
    },
  },
}));

describe("UserController", () => {
  const token = jwt.sign({ userId: 1, username: "testuser" }, process.env.JWT_SECRET || "secret");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return owned clubs", async () => {
    const mockClubs = [
      { id: 1, name: "Club 1", logo: "logo1.png" },
    ];
    vi.mocked(prisma.club.findMany).mockResolvedValue(mockClubs as any);

    const response = await request(app.callback())
      .get("/api/user/owned-clubs")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockClubs);
    expect(prisma.club.findMany).toHaveBeenCalledWith({
      where: { ownerId: 1 },
      select: { id: true, name: true, logo: true }
    });
  });
});
