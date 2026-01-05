import Router from "koa-router";
import interactionController from "../controllers/interactionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

// Get interactions on my posts
router.get("/my", authMiddleware, interactionController.getMyInteractions);

// Get interaction counts by type
router.get(
  "/my/counts",
  authMiddleware,
  interactionController.getMyInteractionCounts
);

export default router;
