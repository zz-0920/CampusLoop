import Router from "koa-router";
import postController from "../controllers/postController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

router.post("/", authMiddleware, postController.create);
router.get("/", authMiddleware, postController.getAll); // Auth for personalized feed
router.get("/search", authMiddleware, postController.search); // Search posts and users
router.get("/:id", authMiddleware, postController.getById); // Get post details
router.post("/:id/interact", authMiddleware, postController.interact);
router.get("/:id/comments", authMiddleware, postController.getComments); // Get comments
router.post("/:id/comments", authMiddleware, postController.addComment); // Add comment

export default router;
