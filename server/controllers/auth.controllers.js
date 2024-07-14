import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { secret } from "../config.js";
import jwt from "jsonwebtoken";
export const Def = async (req, res) => {
  try {
    return res.status(200).json({ message: "API" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
export const signUp = async (req, res) => {
  try {
    console.log("Registro");
    const Nick = req.body.Nick.trim();
    const Email = req.body.Email.trim();
    const PasswordText = req.body.Password.trim();
    if (
      Nick === null ||
      Email === null ||
      PasswordText === null ||
      Nick.length < 3 ||
      Email.length < 9 ||
      PasswordText.length < 8
    ) {
      return res.status(400).json({
        message: "Datos vacios, porfavor diligencie de nuevo los campos.",
      });
    }
    const validateEmail = (email) => {
      const regex = new RegExp(
        /^([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])$/
      );
      return regex.test(email);
    };
    const validateText = (Text) => {
      const regex = new RegExp(/^[a-zA-ZÀ-ÿ0-9]{3,10}$/);
      return regex.test(Text);
    };
    const validatePassword = (Password) => {
      const regex = new RegExp(/^[a-zA-ZÀ-ÿ0-9#$@!?¿]{8,10}$/);
      return regex.test(Password);
    };
    if (
      validateEmail(Email) &&
      validatePassword(PasswordText) &&
      validateText(Nick)
    ) {
      const [QueryUser] = await pool.query(
        `SELECT Email,Nick from user WHERE Email=? OR Nick=?`,
        [Email, Nick]
      );
      console.log(QueryUser);
      if (QueryUser.length > 0) {
        const EmailFind = QueryUser.find((item) => item.Email === Email);
        const NickFind = QueryUser.find((item) => item.Nick === Nick);
        let Action = { Email: false, Nick: false };
        if (NickFind !== undefined) {
          Action.Nick = true;
        }
        if (EmailFind !== undefined) {
          Action.Email = true;
        }
        return res
          .status(404)
          .json({ message: "Datos ya registrados", Action });
      }
      const Password = await bcrypt.hash(PasswordText, 13);
      const [newUser] = await pool.query(
        `INSERT INTO user(Nick, Email,Password,Rol,Photo) VALUES (?,?,?,?,?)`,
        [
          Nick,
          Email,
          Password,
          1,
          "https://pbs.twimg.com/profile_images/1465467187238518793/lydoJIZ8_400x400.jpg",
        ]
      );
      const token = jwt.sign({ id: newUser.insertId }, secret, {
        expiresIn: 86400,
      });
      res.status(201).json({ token });
    } else {
      res.status(400).json({
        message: "Datos invalidos, porfavor diligencie de nuevo los campos.",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const signIn = async (req, res) => {
  try {
    const Email = req.body.Email;
    const Password = req.body.Password;
    const [User] = await pool.query(`SELECT * FROM user WHERE Email=?`, [
      Email,
    ]);
    if (User.length === 0) {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
    const compareHash = await bcrypt.compare(Password, User[0].Password);
    if (!compareHash)
      return res.status(400).json({ message: "Clave incorrecta" });
    const token = jwt.sign({ id: User[0].Id }, secret, {
      expiresIn: 86400,
    });
    res.status(201).json({ token, User });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
