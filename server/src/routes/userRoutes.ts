import Router from "koa-router";
import authController from "../controllers/authController.js";
import userController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

// Protected routes - current user
router.get("/profile", authMiddleware, authController.getProfile);
router.get("/owned-clubs", authMiddleware, userController.getOwnedClubs);

// User by ID routes
router.get("/:id", authMiddleware, userController.getById);
router.get("/:id/posts", authMiddleware, userController.getPosts);
router.get("/:id/followers", authMiddleware, userController.getFollowers);
router.get("/:id/following", authMiddleware, userController.getFollowing);
router.post("/:id/follow", authMiddleware, userController.toggleFollow);

export default router;
