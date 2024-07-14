import { pool } from "../db.js";
export const getCardsBlack = async (req, res) => {
  try {
    const [result] = await pool.query(`SELECT * FROM cartas_negras LIMIT 0,38`);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getCardBlack = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT * FROM cartas_negras WHERE Id=?`,
      [req.params.id]
    );
    if (result.length === 0)
      return res.status(404).json({ message: "Carta con encontrada" });

    res.status(200).json(result[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const createCardBlack = async (req, res) => {
  try {
    const { Texto, Tipo } = req.body;
    const [newCard] = await pool.query(
      `INSERT INTO cartas_negras (Texto,Tipo) VALUES (?,?)`,
      [Texto, Tipo]
    );

    res.status(201).json({
      Id: newCard.insertId,
      Texto,
      Tipo,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateCardBlack = async (req, res) => {
  try {
    const { Texto, Tipo } = req.body;
    const result = await pool.query(
      `UPDATE cartas_negras SET Texto=?,Tipo=? WHERE Id=?`,
      [Texto, Tipo, req.params.id]
    );
    res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const deleteCardBlack = async (req, res) => {
  try {
    const [result] = await pool.query(`DELETE FROM cartas_negras WHERE Id=?`, [
      req.params.id,
    ]);
    if (result.length === 0)
      return res.status(404).json({ message: "Carta inexistente" });
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//Cards white
export const getCardsWhite = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT * FROM cartas_blancas LIMIT 0,38`
    );
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getCardWhite = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT * FROM cartas_blancas WHERE Id=?`,
      [req.params.id]
    );
    if (result.length === 0)
      return res.status(404).json({ message: "Carta con encontrada" });

    res.status(200).json(result[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const createCardWhite = async (req, res) => {
  try {
    const { Texto } = req.body;
    const [newCard] = await pool.query(
      `INSERT INTO cartas_blancas (Texto,Tipo) VALUES (?,?)`,
      [Texto]
    );

    res.status(201).json({
      Id: newCard.insertId,
      Texto,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateCardWhite = async (req, res) => {
  try {
    const { Texto } = req.body;
    const result = await pool.query(
      `UPDATE cartas_blancas SET Texto=?,Tipo=? WHERE Id=?`,
      [Texto, req.params.id]
    );
    res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const deleteCardWhite = async (req, res) => {
  try {
    const [result] = await pool.query(`DELETE FROM cartas_blancas WHERE Id=?`, [
      req.params.id,
    ]);
    if (result.length === 0)
      return res.status(404).json({ message: "Carta inexistente" });
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
