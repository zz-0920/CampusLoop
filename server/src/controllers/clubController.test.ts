import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import prisma from "../utils/prisma.js";
import jwt from "jsonwebtoken";

vi.mock("../utils/prisma.js", () => ({
  default: {
    club: {
      create: vi.fn(),
    },
  },
}));

describe("ClubController", () => {
  const token = jwt.sign({ userId: 1, username: "testuser" }, process.env.JWT_SECRET || "secret");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new club", async () => {
    const clubData = {
      name: "Test Club",
      description: "A club for testing",
      logo: "logo.png",
    };

    const mockClub = {
      id: 1,
      ...clubData,
      ownerId: 1,
      memberCount: 1,
      createdAt: new Date(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prisma.club.create).mockResolvedValue(mockClub as any);

    const response = await request(app.callback())
      .post("/api/clubs")
      .set("Authorization", `Bearer ${token}`)
      .send(clubData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({
      name: clubData.name,
      ownerId: 1,
    }));
    expect(prisma.club.create).toHaveBeenCalledWith({
      data: {
        name: clubData.name,
        description: clubData.description,
        logo: clubData.logo,
        ownerId: 1,
        memberCount: 1,
      },
    });
  });

  it("should return 400 if club name is missing", async () => {
    const response = await request(app.callback())
      .post("/api/clubs")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "No name" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Club name is required");
  });
});
