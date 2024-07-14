import { Router } from "express";
import { authJwt } from "../middlewares/index.js";
import { updateUser, getLogrosUser } from "../controllers/users.controllers.js";
const router = Router();
router.get("/user/:id", authJwt.verifyToken, getLogrosUser);
router.put("/user", authJwt.verifyToken, updateUser);
export default router;
