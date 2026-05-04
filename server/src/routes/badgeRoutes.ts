import Router from "koa-router";
import badgeController from "../controllers/badgeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

// All badge routes require auth
router.get("/", authMiddleware, badgeController.getAllBadges);
router.post("/check", authMiddleware, badgeController.checkAndUnlock);
router.post("/:id/toggle-display", authMiddleware, badgeController.toggleDisplay);
router.get("/display/:userId", authMiddleware, badgeController.getDisplayBadges);

export default router;
