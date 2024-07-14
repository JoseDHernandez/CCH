import { Router } from "express";
import { signIn, signUp, Def } from "../controllers/auth.controllers.js";
const router = Router();
router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/info", Def);
export default router;
