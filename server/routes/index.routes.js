import { Router } from "express";
import { pool } from "../db.js";
const router = Router();
router.get("/index", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM cartas_negras WHERE id =10;");
  console.log(rows);
  res.json(rows);
});
router.get("/", (req, res) => {
  res.send("Cartas contra la humanidad");
});
export default router;
