import Router from "koa-router";
import clubController from "../controllers/clubController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

router.get("/:id", authMiddleware, clubController.getById);
router.post("/", authMiddleware, clubController.create);

export default router;
