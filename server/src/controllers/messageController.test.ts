import { describe, it, expect, vi, beforeEach } from "vitest";
import messageController from "./messageController.js";
import prisma from "../utils/prisma.js";

vi.mock("../utils/prisma.js", () => ({
  default: {
    message: {
      create: vi.fn(),
    },
  },
}));

describe("MessageController.sendMessage", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockIo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCtx: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIo = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn().mockReturnThis(),
    };
    mockCtx = {
      state: { user: { userId: 1 } },
      request: { body: {} },
      io: mockIo,
      status: 0,
      body: {},
    };
  });

  it("should emit receive_message to club room when clubId is provided", async () => {
    mockCtx.request.body = { clubId: 10, content: "Hello club" };
    const mockMessage = { id: 1, content: "Hello club", senderId: 1, clubId: 10 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as any);

    await messageController.sendMessage(mockCtx);

    expect(mockIo.to).toHaveBeenCalledWith("club_10");
    expect(mockIo.emit).toHaveBeenCalledWith("receive_message", mockMessage);
  });

  it("should emit receive_message to public_room when isPublic is true", async () => {
    mockCtx.request.body = { isPublic: true, content: "Hello public" };
    const mockMessage = { id: 2, content: "Hello public", senderId: 1, isPublic: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as any);

    await messageController.sendMessage(mockCtx);

    expect(mockIo.to).toHaveBeenCalledWith("public_room");
    expect(mockIo.emit).toHaveBeenCalledWith("receive_message", mockMessage);
  });
});
