import { Router } from "express";
import { authJwt } from "../middlewares/index.js";
import {
  joinParty,
  partyData,
  partyPassword,
  updateParty,
  startGame,
  getNumbersCards,
  getCardsInGame,
  updateCardsInGame,
  saveCardsInGame,
  getCardsPlay,
  updatePointsGame,
  getPoints,
  uploadCardsPlay,
  deleteParty,
} from "../controllers/game.controllers.js";
const router = Router();
//index
router.get("/Game", authJwt.verifyToken);
//Salas
router.get("/lobby/:code", authJwt.verifyToken, joinParty); //unirse a una partida
router.get("/party/:code", authJwt.verifyToken, partyData); //Entrar en lobby de la partida
router.post("/party", authJwt.verifyToken, partyPassword); //Verificar contrasena de la partida (si exite)
router.put("/party", authJwt.verifyToken, updateParty); // Actualizar datos de la partida
//Juego
router.post("/game", authJwt.verifyToken, startGame); //Inicia el juego
router.get("/game", authJwt.verifyToken, getNumbersCards); //N de Id maximo de cartas
router.get("/cards/:token", authJwt.verifyToken, getCardsInGame); //Obtener mazo del jugador
router.get("/cardsOther/:token", authJwt.verifyToken, updateCardsInGame); //Obtener nuevas cartas de reserva
router.post("/cards", authJwt.verifyToken, saveCardsInGame); //Guardar mazo del jugador
router.get("/cartas/:token", authJwt.verifyToken, getCardsPlay); //obtener cartas selecionas por los jugadores
router.put("/game", authJwt.verifyToken, updatePointsGame); //Actualizar puntos y ronda en el sv
router.get("/points/:token", authJwt.verifyToken, getPoints); // Obtener puntuaciones
router.put("/cards", authJwt.verifyToken, uploadCardsPlay); //Guardar cartas seleccionadas en el sv
router.delete("/party", authJwt.verifyToken, deleteParty);
//Barajas guardadas //*pendiente
router.get("/packCards/:nick", authJwt.verifyToken);
router.post("/packCards/:nick", authJwt.verifyToken);
export default router;
