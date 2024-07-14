import { Router } from "express";
import { authJwt } from "../middlewares/index.js";
import {
  getCardBlack,
  getCardsBlack,
  updateCardBlack,
  deleteCardBlack,
  createCardBlack,
  getCardsWhite,
  getCardWhite,
  updateCardWhite,
  deleteCardWhite,
  createCardWhite,
} from "../controllers/cards.controllers.js";
const router = Router();
router.get("/cardsBlack", getCardsBlack);
router.post(
  "/cardsBlack",
  [authJwt.verifyToken, authJwt.isAdmin],
  createCardBlack
);
router.put(
  "/cardsBlack/:id",
  [authJwt.verifyToken, authJwt.isModerator],
  updateCardBlack
);
router.get("/cardsBlack/:id", getCardBlack);
router.delete("/cardsBlack/:id", authJwt.verifyToken, deleteCardBlack);
//Crads White
router.get("/cardsWhite", getCardsWhite);
router.post(
  "/cardsWhite",
  [authJwt.verifyToken, authJwt.isAdmin],
  createCardWhite
);
router.put(
  "/cardsWhite/:id",
  [authJwt.verifyToken, authJwt.isAdmin],
  updateCardWhite
);
router.get("/cardsWhite/:id", getCardWhite);
router.delete(
  "/cardsWhite/:id",
  [authJwt.verifyToken, authJwt.isAdmin],
  deleteCardWhite
);
export default router;
