import Router from "koa-router";
import authController from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = new Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/change-password", authMiddleware, authController.changePassword);

export default router;
