import type { Context } from "koa";
import prisma from "../utils/prisma.js";

import { Server } from "socket.io";

interface AuthState {
  user: {
    userId: number;
    [key: string]: unknown;
  };
}

class MessageController {
  // Get list of conversations (recent contacts)
  async getConversations(ctx: Context) {
    const userId = (ctx.state as AuthState).user.userId;

    try {
      // Find all distinct users exchanged messages with
      // This is complex in Prisma 5 involving raw query or fetching messages and reducing
      // Simplified approach: Get recent messages sent or received, grouped by other party

      const distinctSenderIds = await prisma.message.findMany({
        where: { receiverId: userId },
        distinct: ["senderId"],
        select: { senderId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });

      const distinctReceiverIds = await prisma.message.findMany({
        where: { senderId: userId },
        distinct: ["receiverId"],
        select: { receiverId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });

      // Merge and unique
      const contactIds = Array.from(
        new Set([
          ...distinctSenderIds.map((m) => m.senderId),
          ...distinctReceiverIds.map((m) => m.receiverId),
        ])
      );

      // Fetch user details for these contacts
      const contacts = await prisma.user.findMany({
        where: { id: { in: contactIds } },
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      });

      // Attach last message
      const conversations = await Promise.all(
        contacts.map(async (contact) => {
          const lastMessage = await prisma.message.findFirst({
            where: {
              OR: [
                { senderId: userId, receiverId: contact.id },
                { senderId: contact.id, receiverId: userId },
              ],
            },
            orderBy: { createdAt: "desc" },
          });

          // Count unread
          const unreadCount = await prisma.message.count({
            where: {
              senderId: contact.id,
              receiverId: userId,
              isRead: false,
            },
          });

          return {
            contact,
            lastMessage,
            unreadCount,
          };
        })
      );

      // Sort by last message time
      conversations.sort((a, b) => {
        const timeA = a.lastMessage?.createdAt.getTime() || 0;
        const timeB = b.lastMessage?.createdAt.getTime() || 0;
        return timeB - timeA;
      });

      ctx.body = conversations;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  // Get messages with a specific user
  async getMessages(ctx: Context) {
    const userId = (ctx.state as AuthState).user.userId;
    const { contactId } = ctx.params;

    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: Number(contactId) },
            { senderId: Number(contactId), receiverId: userId },
          ],
        },
        orderBy: { createdAt: "asc" }, // Oldest first
      });

      // Mark messages from contact as read
      await prisma.message.updateMany({
        where: {
          senderId: Number(contactId),
          receiverId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      ctx.body = messages;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  // Mark messages from a contact as read
  async markAsRead(ctx: Context) {
    const userId = (ctx.state as AuthState).user.userId;
    const { contactId } = ctx.params;

    try {
      const result = await prisma.message.updateMany({
        where: {
          senderId: Number(contactId),
          receiverId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      ctx.body = { updated: result.count };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }

  // Send a message
  async sendMessage(ctx: Context) {
    const userId = (ctx.state as AuthState).user.userId;
    const { receiverId, content } = ctx.request.body as {
      receiverId: string | number;
      content: string;
    };

    if (!receiverId || !content) {
      ctx.status = 400;
      ctx.body = { error: "receiverId and content are required" };
      return;
    }

    try {
      const message = await prisma.message.create({
        data: {
          senderId: userId,
          receiverId: Number(receiverId),
          content,
        },
      });

      // Emit to receiver's room
      const io = (ctx as Context & { io: Server }).io;
      if (io) {
        io.to(`user_${receiverId}`).emit("receive_message", message);
      }

      ctx.status = 201;
      ctx.body = message;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: (error as Error).message };
    }
  }
}

export default new MessageController();
