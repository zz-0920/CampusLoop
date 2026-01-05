import Router from "koa-router";
import discoverController from "../controllers/discoverController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

router.get("/users", authMiddleware, discoverController.getUsers);
router.get("/clubs", authMiddleware, discoverController.getClubs);

export default router;
