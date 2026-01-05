import type { Context } from "koa";
import prisma from "../utils/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface RegisterBody {
  username: string;
  password: string;
  name: string;
}

interface LoginBody {
  username: string;
  password: string;
}

interface JwtPayload {
  userId: number;
  username: string;
}

class AuthController {
  async register(ctx: Context) {
    const { username, password, name } = ctx.request.body as RegisterBody;

    try {
      // Basic validation
      if (!username || !password || !name) {
        ctx.status = 400;
        ctx.body = { error: "Missing required fields" };
        return;
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        ctx.status = 400;
        ctx.body = { error: "Username already exists" };
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          name,
          school: "测试大学",
          department: "计算机学院",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, // Default avatar
        },
      });

      ctx.status = 201;
      ctx.body = {
        message: "User registered successfully",
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
        },
      };
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async login(ctx: Context) {
    const { username, password } = ctx.request.body as LoginBody;

    try {
      const user = await prisma.user.findUnique({ where: { username } });

      if (!user) {
        ctx.status = 401;
        ctx.body = { error: "Invalid username or password" };
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        ctx.status = 401;
        ctx.body = { error: "Invalid username or password" };
        return;
      }

      // Generate JWT Token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      ctx.body = {
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          school: user.school,
        },
      };
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getProfile(ctx: Context) {
    const userId = (ctx.state.user as JwtPayload).userId;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          school: true,
          department: true,
          bio: true,
          isVerified: true,
          _count: {
            select: {
              posts: true,
              followedBy: true,
              following: true,
              interactions: true,
            },
          },
        },
      });

      if (!user) {
        ctx.status = 404;
        ctx.body = { error: "User not found" };
        return;
      }

      ctx.body = user;
    } catch (error: unknown) {
      ctx.status = 500;
      ctx.body = {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default new AuthController();
