import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import serve from "koa-static";
import path from "path";

dotenv.config();

const app = new Koa();
const httpServer = createServer(app.callback());
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all for now, or match frontend URL
    methods: ["GET", "POST"],
  },
});

// Attach io to context
app.context.io = io;

// Socket.io Middleware for Auth
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "loading_secret"
    );
    socket.data.user = decoded;
    next();
  } catch {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.data.user?.id);

  // Join user to their own room
  if (socket.data.user?.id) {
    socket.join(`user_${socket.data.user.id}`);
  }

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

import router from "./routes/index.js";

// Middlewares
app.use(cors());
app.use(bodyParser());
app.use(serve(path.join(process.cwd(), "uploads")));
// Let's keep it simple: serve the uploads directory. If I request http://host/filename.jpg it will work.
// But my upload route returns `${protocol}://${host}/uploads/${ctx.file.filename}`.
// So I need to mount it at /uploads.
// I didn't install koa-mount.
// Let's verify if I can just serve the root and access via /uploads if the folder is named uploads? No, koa-static serves CONTENTS of the folder.
// If I serve `process.cwd()`, then `/uploads/filename` would work.
// Let's change to serve process.cwd() but restricted? No that's unsafe.
// I should install koa-mount or just use another router for static?
// Or I can just serve "uploads" directory, and the URL I return in uploadRoutes.ts should be `${protocol}://${host}/${ctx.file.filename}` if I serve it at root.
// BUT I want /uploads/... prefix for clarity.
// So:
// 1. Install koa-mount?
// 2. Or just change uploadRoutes to return `${protocol}://${host}/${ctx.file.filename}` and serve `uploads` dir at root.
// Let's go with option 2 for simplicity as of now to avoid more installs, UNLESS I feel unsafe.
// Wait, if I serve `uploads` dir at root, then `http://localhost:3000/image.png` works.
// That is fine.
// So I will change the code in uploadRoutes.ts later if needed, or just let it be.
// Actually, `koa-static` does NOT support mounting at a path out of the box without `koa-mount`.
// Let's install `koa-mount` to be safe and clean.
// Or... I can just use `koa-static` on a directory, and that directory is root.
// If I want /uploads/image.png, I should have a folder `public/uploads` and serve `public`.
// But I am writing simple code.
// Let's try to install `koa-mount`.
// OR: I can just change `uploadRoutes.ts` to return root paths.
// Let's do the simplest thing: Serve `uploads` directory.
// Return URL: `${protocol}://${host}/${ctx.file.filename}`.
// WAIT. If I have `api/...` routes, will static middleware conflict?
// Static middleware usually calls `next()` if file not found.
// So it's fine.
// I will just serve the `uploads` directory at the root context.
app.use(serve(path.join(process.cwd(), "uploads")));

// Routes
app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
