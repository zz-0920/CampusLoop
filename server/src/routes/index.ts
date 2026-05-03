import Router from "koa-router";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import postRoutes from "./postRoutes.js";
import discoverRoutes from "./discoverRoutes.js";
import messageRoutes from "./messageRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import interactionRoutes from "./interactionRoutes.js";
import clubRoutes from "./clubRoutes.js";
import eventRoutes from "./eventRoutes.js";

const router = new Router();

// API prefix
router.prefix("/api");

// Mount routes
router.use("/auth", authRoutes.routes(), authRoutes.allowedMethods());
router.use("/user", userRoutes.routes(), userRoutes.allowedMethods()); // /api/user/profile
router.use("/posts", postRoutes.routes(), postRoutes.allowedMethods()); // /api/posts
router.use(
  "/discover",
  discoverRoutes.routes(),
  discoverRoutes.allowedMethods()
); // /api/discover
router.use("/messages", messageRoutes.routes(), messageRoutes.allowedMethods()); // /api/messages
router.use("/interactions", interactionRoutes.routes(), interactionRoutes.allowedMethods()); // /api/interactions
router.use("/clubs", clubRoutes.routes(), clubRoutes.allowedMethods()); // /api/clubs
router.use("/events", eventRoutes.routes(), eventRoutes.allowedMethods()); // /api/events
router.use(uploadRoutes.routes(), uploadRoutes.allowedMethods()); // /api/upload

export default router;
