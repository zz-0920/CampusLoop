import Router from "koa-router";
import eventController from "../controllers/eventController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

router.get("/", eventController.getAll);
router.post("/", authMiddleware, eventController.create);

export default router;
