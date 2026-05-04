import Router from "koa-router";
import messageController from "../controllers/messageController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

router.get(
  "/conversations",
  authMiddleware,
  messageController.getConversations
);
router.get("/public", authMiddleware, messageController.getPublicMessages);
router.get("/unread-count", authMiddleware, messageController.getUnreadCount);
router.get("/club/:clubId", authMiddleware, messageController.getGroupMessages);
router.get("/:contactId", authMiddleware, messageController.getMessages);
router.post("/:contactId/read", authMiddleware, messageController.markAsRead);
router.post("/", authMiddleware, messageController.sendMessage);

export default router;
