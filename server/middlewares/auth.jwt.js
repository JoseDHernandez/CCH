import jwt from "jsonwebtoken";
import { secret } from "../config.js";
import { pool } from "../db.js";
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["token"];
    //console.log("token auth: " + token);
    if (!token) return res.status(403).json({ menssage: "Token invalido" });
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    const [user] = await pool.query(
      `SELECT Id,Nick,Email,Photo,Puntos,Rol FROM user WHERE Id=?`,
      [req.userId]
    );
    if (!user[0])
      return res.status(404).json({ menssage: "El usuario no existe" });
    next();
  } catch (error) {
    return res.status(401).json({ menssage: "Sin permiso" });
  }
};
export const isAdmin = async (req, res, next) => {
  try {
    const [user] = await pool.query(
      `SELECT Id,Nick,Email,Photo,Puntos,Rol FROM user WHERE Id=? AND Rol=3`,
      [req.userId]
    );
    if (!user[0])
      return res
        .status(404)
        .json({ menssage: "El usuario no existe o no tiene permiso" });
    next();
  } catch (error) {
    return res.status(401).json({ menssage: "Sin permiso" });
  }
};
export const isModerator = async (req, res, next) => {
  try {
    console.log("Mod");
    const [user] = await pool.query(
      `SELECT Id,Nick,Email,Photo,Puntos,Rol FROM user WHERE Id=? AND Rol=2`,
      [req.userId]
    );
    console.log(req.userId);
    if (!user[0])
      return res
        .status(404)
        .json({ menssage: "El usuario no existe o no tiene permiso" });
    next();
  } catch (error) {
    return res.status(401).json({ menssage: "Sin permiso" });
  }
};
