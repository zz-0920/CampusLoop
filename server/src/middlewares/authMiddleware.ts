import type { Context, Next } from "koa";
import jwt from "jsonwebtoken";

export const authMiddleware = async (ctx: Context, next: Next) => {
  const token = ctx.headers.authorization?.split(" ")[1];

  if (!token) {
    ctx.status = 401;
    ctx.body = { error: "Access denied. No token provided." };
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    ctx.state.user = decoded; // Attach user info to context state
    await next();
  } catch {
    ctx.status = 401;
    ctx.body = { error: "Invalid token." };
  }
};
