import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import {
  validateEmail,
  validateUrl,
  validatePassword,
  validateUser,
} from "../middlewares/userRegex.js";
export const listUsers = async (req, res) => {
  try {
    const [result] = await pool.query(`SELECT * FROM user LIMIT 0,20`);
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//Logros del usuario
export const getLogrosUser = async (req, res) => {
  try {
    const idUser = req.params.id;
    if (isNaN(idUser) || idUser <= 0) {
      return res.status(400).json({ message: "Usuario invalido" });
    }
    const [result] = await pool.query(
      `SELECT logros.Id, logros.Texto, CASE WHEN logros_user.Id_user = ? THEN logros.Descripcion ELSE NULL END AS Descripcion FROM logros LEFT JOIN logros_user ON logros.Id = logros_user.Id_Logro AND logros_user.Id_user = ?`,
      [idUser, idUser]
    );
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const idUser = req.body.Id;
  const emailUser = req.body.Email;
  const paswordUser = req.body.Password;
  const nickUser = req.body.Nick;
  const photoUser = req.body.Photo;
  if (
    !isNaN(idUser) ||
    !validateEmail(emailUser) ||
    !validatePassword(paswordUser) ||
    !validateUser(nickUser) ||
    photoUser !== 1 ||
    !validateUrl(photoUser)
  ) {
    return res.status(500).json({ message: "Datos invalidos" });
  }
  try {
    const [userQuery] = await pool.query(
      `SELECT * FROM user WHERE Id =? AND Email=? AND Nick=? `,
      idUser,
      emailUser,
      nickUser
    );
    if (userQuery.length === 0) {
      return res
        .status(400)
        .json({ message: "Datos no concidientes con el usuario" });
    }
    const Password = await bcrypt.hash(paswordUser, 13);
    const result = await pool.query(
      `UPDATE user SET Nick = ? , Email=?,Password=?,Photo=? WHERE Id =?`,
      [nickUser, emailUser, Password, photoUser, idUser]
    );
    res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
