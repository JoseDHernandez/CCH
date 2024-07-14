import { pool } from "../db.js";
import jwt from "jsonwebtoken";
import { secret } from "../config.js";
import bcrypt from "bcryptjs";
import { validatePassword, validateTitle } from "../middlewares/userRegex.js";
import { json } from "express";
import {
  NumberRandom,
  generateUniqueArrays,
} from "../middlewares/numRandom.js";
//! Unirse a una partida
export const joinParty = async (req, res) => {
  try {
    const Codigo = req.params.code;
    const [findParty] = await pool.query(
      `SELECT Id,Estado FROM partida WHERE Codigo=?`,
      [Codigo]
    );
    if (findParty.length > 0) {
      return res.status(200).json({ Token: false, Code: Codigo });
    }
    res.status(400).json({ message: "Partida no encontrada" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//! Obtener los datos de la partida
export const partyData = async (req, res) => {
  try {
    const codeParty = req.params.code;
    const [response] = await pool.query(
      `SELECT Nombre, Turno AS "Zar",partida.Id,Nick,JSON_LENGTH(Players) AS 'Players',user.Id AS userId,estado.Estado AS "Estado",partida.Estado AS "Sta",Rondas,RondaActual,LimitePlayers,RondaActual,Codigo, CASE WHEN partida.Password IS NULL THEN 'false' ELSE 'true' END AS "Password" FROM partida INNER JOIN user ON user.Id = Owner INNER JOIN estado ON estado.Id = partida.Estado WHERE Codigo =?`,
      [codeParty]
    );
    if (response.length === 0) {
      return res.status(404).json({ message: "Partida no encontrada" });
    } else if (response.length > 1) {
      return res.status(400).json({ message: "Codigo de partida invalido" });
    }
    const data = response[0];
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//! Validar la clave de la partida(Privada)
export const partyPassword = async (req, res) => {
  try {
    const codeParty = req.body.Code;
    const Password = req.body.Password;
    const IdUser = req.body.Id;
    if (!validatePassword(Password))
      return res.status(400).json({ message: "Contraseña invalida" });
    const [dataRoom] = await pool.query(
      `SELECT Id,Password,Players FROM partida WHERE Codigo =?`,
      [codeParty]
    );
    if (dataRoom.length === 0) {
      return res.status(404).json({ message: "Partida no encontrada." });
    }
    console.log(Password);
    const validateHash = await bcrypt.compare(Password, dataRoom[0].Password);
    if (!validateHash)
      return res.status(400).json({ message: "Contraseña inconcidiente" });
    const [addList] = await pool.query(
      `INSERT INTO partida (Players) VALUES ({?})`,
      [dataRoom[0].Players.push(IdUser)]
    );
    console.log(addList);
    const token = jwt.sign(
      { code: codeParty, id: dataRoom[0].Id, userId: IdUser },
      secret,
      {
        expiresIn: 7200,
      }
    );
    res.status(200).json({ Code: codeParty, Token: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//! Actualizar rondas o jugadores de la partida
export const updateParty = async (req, res) => {
  try {
    const token = req.body.token;
    const rounds = req.body.newRounds;
    const players = req.body.newPlayers;
    const name = req.body.newName;
    if (!token)
      return res.status(403).json({ menssage: "Token de la partida invalido" });
    const data = jwt.verify(token, secret);
    const userId = data.userId;
    const idParty = data.id;
    const [idOwner] = await pool.query(
      `SELECT Owner, Rondas,LimitePlayers, Nombre FROM partida WHERE Id=${idParty}`
    );
    if (idOwner[0].Owner != userId) {
      return res.status(400).json({ menssage: "Sin permiso" });
    }
    let options = {
      Rounds: idOwner[0].Rondas,
      Players: idOwner[0].LimitePlayers,
      Nombre: idOwner[0].Nombre,
    };
    if (validateTitle(name.trim())) {
      options.Nombre = name.trim();
    }
    if (4 <= rounds) {
      options.Rounds = rounds;
    }
    if (options.Players < players) {
      options.Players = players;
    }
    const update = await pool.query(
      `UPDATE partida SET Rondas=? , LimitePlayers=?, Nombre=? WHERE Id=?`,
      [options.Rounds, options.Players, options.Nombre, idParty]
    );
    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//! Obtener numero maximo de cartas
export const getNumbersCards = async (req, res) => {
  try {
    const [cardsBlack] = await pool.query(
      `SELECT max(cartas_negras.Id) AS "MaxCardBlack" FROM cartas_negras`
    );
    const [cardsWhite] = await pool.query(
      `SELECT max(cartas_blancas.Id) AS "MaxCardWhite" FROM cartas_blancas`
    );
    res.status(200).json({
      MaxCardBlack: cardsBlack[0].MaxCardBlack,
      MaxCardWhite: cardsWhite[0].MaxCardWhite,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//! Iniciar juego
export const startGame = async (req, res) => {
  try {
    console.log("\n\nInicio de juego");
    //Token
    const dataToken = jwt.verify(req.body.Token, secret);
    const partyId = dataToken.id;
    const userId = dataToken.userId;
    //Datos partida
    const [dataParty] = await pool.query(
      `SELECT Players, Rondas, JSON_EXTRACT(Players,'$') AS "PlayersIds" FROM partida WHERE Id=? AND Owner=?`,
      [partyId, userId]
    );
    console.log(dataParty);
    const ids = JSON.parse(dataParty[0].PlayersIds);
    console.log(ids);
    const Players = JSON.parse(dataParty[0].Players).length;
    const Rondas = dataParty[0].Rondas;
    //N max de cartas
    const MaxCardBlack = req.body.CBlack;
    const MaxCardWhite = req.body.CWhite;
    const cardsBlack = NumberRandom(1, MaxCardBlack, Rondas + 4, []);
    const cardsWhite = generateUniqueArrays(Players, 1, MaxCardWhite, 20);
    //Crear mazos
    let Mazos = [];
    for (let i = 0; i <= Players - 1; i++) {
      Mazos.push({ Id: ids[i], Cards: cardsWhite[i] });
    }
    const MazosJSON = JSON.stringify(Mazos);
    //Seleccionar zar
    const ZAR = ids[NumberRandom(0, Players - 1, 1, [])];
    //Objeto de puntos de los jugadores
    let Points = [];
    for (let i = 0; i <= Players - 1; i++) {
      Points.push({ Id: ids[i], points: 0 });
    }
    const PointsJSON = JSON.stringify(Points);
    //Lista unica de cartas blancas
    const CardsWhite = cardsWhite.reduce((result, currentArray) => {
      return result.concat(currentArray);
    }, []);
    //Actualizar datos partida
    const update = await pool.query(
      `UPDATE partida SET Estado=?,RondaActual=?,Turno=?,Puntos=?,Barajas=?, Negras=JSON_ARRAY(?), BlancasUsadas=JSON_ARRAY(?), Cartas=JSON_ARRAY() WHERE Id=?`,
      [2, 1, ZAR, PointsJSON, MazosJSON, cardsBlack, CardsWhite, partyId]
    );
    res.status(201).json({ mgs: "Buena chino" });
    console.log("\n");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//! Obtener mazo
export const getCardsInGame = async (req, res) => {
  try {
    const Token = jwt.verify(req.params.token, secret);
    const partyId = Token.id;
    const userId = Token.userId;
    const [partyData] = await pool.query(
      `SELECT JSON_EXTRACT(Players,'$') AS "Players", RondaActual, Turno AS "Zar",JSON_EXTRACT(Negras,'$') AS "JsonBlack" FROM partida WHERE Id=?`,
      [partyId]
    );
    const ZarId = partyData[0].Zar;
    const JsonIndex = JSON.parse(partyData[0].Players);
    const index = JsonIndex.indexOf(userId);
    const JsonBlack = JSON.parse(partyData[0].JsonBlack);
    const idBlack = JsonBlack[partyData[0].RondaActual - 1];
    if (index === -1)
      return res.status(404).json({
        msg: "Usuario no existente el la lista de jugadores en el servidor.",
      });
    const [cards] = await pool.query(
      `SELECT cartas_blancas.Id, Texto, 0 AS "State" FROM cartas_blancas INNER JOIN partida ON 
      JSON_CONTAINS(partida.Barajas,JSON_ARRAY(cartas_blancas.Id),'$[?].Cards') WHERE partida.Id=?`,
      [index, partyId]
    );
    const [cardBlack] = await pool.query(
      `SELECT * FROM cartas_negras WHERE Id=?`,
      [idBlack]
    );
    res.status(200).json({ CardB: cardBlack, CardsW: cards, Zar: ZarId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//! generar nuevas cartas de reserva
export const updateCardsInGame = async (req, res) => {
  try {
    console.log("Actualizando mazo");
    const Token = jwt.verify(req.params.token, secret);
    const userId = Token.userId;
    const partyId = Token.id;
    const [partyData] = await pool.query(
      `SELECT JSON_EXTRACT(BlancasUsadas,'$') AS "cardsInUse" FROM partida WHERE Id=?`,
      [partyId]
    );
    const JsonCardsInUse = partyData[0].cardsInUse; //Cartas usadas
    const [cardsWhite] = await pool.query(
      `SELECT max(cartas_blancas.Id) AS "MaxCardWhite" FROM cartas_blancas`
    );
    //Array con las nuevas cartas
    let NewCards = generateUniqueArrays(1, 1, cardsWhite[0].MaxCardWhite, 10);
    NewCards = NewCards[0];
    //Actualizar cartas usadas
    const cards = JsonCardsInUse.concat(NewCards);
    await pool.query(
      `UPDATE partida SET BlancasUsadas=JSON_ARRAY(?) WHERE Id=?`,
      [cards, partyId]
    );
    res.status(200).json(NewCards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//! Guardar mazo en el servidor
export const saveCardsInGame = async (req, res) => {
  try {
    const Cards = req.body.Cards;
    const Token = jwt.verify(req.body.token, secret);
    const userId = Token.userId;
    const partyId = Token.id;
    const [indexPlayer] = await pool.query(
      `SELECT JSON_EXTRACT(Players,'$') AS "Players" FROM partida WHERE Id=?`,
      [partyId]
    );
    const JsonIndex = indexPlayer[0].Players;
    const index = JsonIndex.indexOf(userId);
    //Extraer Ids
    let cardsIds = [];
    Cards.forEach((element) => {
      cardsIds.push(element.Id);
    });
    const update = await pool.query(
      `UPDATE partida SET Barajas=JSON_REPLACE(Barajas,'$[?].Cards',JSON_ARRAY(?)) WHERE Id=?`,
      [index, cardsIds, partyId]
    );
    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//! Guardar cartas seleccionadas en el servidor
export const uploadCardsPlay = async (req, res) => {
  try {
    const Token = jwt.verify(req.body.token, secret);
    const partyId = Token.id;
    const Cards = req.body.cardsData;
    const uploadCards = await pool.query(
      `UPDATE partida SET Cartas=JSON_ARRAY_APPEND(Cartas,'$',?) WHERE Id=?`,
      [Cards, partyId]
    );
    console.log(uploadCards);
    res.status(201).json(uploadCards);
  } catch (error) {
    console.log(error);
  }
};
//! Obtener seleccionadas cartas del servidor
export const getCardsPlay = async (req, res) => {
  try {
    const Token = jwt.verify(req.params.token, secret);
    const partyId = Token.id;
    const [cards] = await pool.query(`SELECT Cartas FROM partida WHERE Id=?`, [
      partyId,
    ]);
    const JsonCards = JSON.parse(cards[0].Cartas);
    res.status(200).json(JsonCards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//! Actualizar puntos y generar la siguiente ronda
export const updatePointsGame = async (req, res) => {
  try {
    const data = req.body;
    const Token = jwt.verify(data.token, secret);
    const CardsWin = data.Cards;
    const userId = Token.userId;
    const partyId = Token.id;
    const [dataParty] = await pool.query(
      `SELECT RondaActual,Turno,JSON_EXTRACT(Players,'$')AS "Players",Rondas, JSON_EXTRACT(Puntos,'$') AS "Puntos" FROM partida WHERE Id=?`,
      [partyId]
    );
    const RondaActual = dataParty[0].RondaActual;
    const Rondas = dataParty[0].Rondas;
    const Players = JSON.parse(dataParty[0].Players);
    const Zar = dataParty[0].Turno;
    if (Zar !== userId) return res.status(200).json({ action: true });
    console.log("New round");
    //Siguiente zar
    const IndexActualZar = Players.indexOf(Zar);
    let newZar;
    if (IndexActualZar === -1) {
      //Generar zar aleatorio
      return;
    } else {
      if (Players.length === IndexActualZar + 1) {
        newZar = Players[0];
      } else {
        newZar = Players[IndexActualZar + 1];
      }
    }
    //Siguiente # ronda
    const newRonda = RondaActual + 1;
    //Json de lus puntajes
    const PuntosActuales = JSON.parse(dataParty[0].Puntos);
    console.log(PuntosActuales);
    //Finaliza el juego
    if (newRonda > Rondas) {
      const update = await pool.query(
        `UPDATE partida SET Cartas=JSON_ARRAY(),RondaActual=?,Turno=0, Barajas=JSON_ARRAY() WHERE Id=?`,
        [RondaActual, partyId]
      );
      let Ids = [];
      PuntosActuales.map((player) => Ids.push(player.Id));
      const [usersPoints] = await pool.query(
        `SELECT Id,Puntos FROM user WHERE Id IN (?)`,
        [Ids]
      );
      let newPoints = "";
      console.log(usersPoints);
      usersPoints.map((user) => {
        const Array = PuntosActuales.find((obj) => obj.Id === user.Id);
        if (Array) {
          newPoints += ` WHEN Id=${user.Id} THEN ${parseInt(
            Array.points + user.Puntos
          )} `;
        }
      });
      console.log(newPoints);
      const updatePoints = await pool.query(
        `UPDATE user SET Puntos = CASE ${newPoints} END WHERE Id IN (?)`,
        [Ids]
      );
      console.log(updatePoints);
      return res.status(201).json({ action: true });
    }
    //*Asignacion de puntos
    let ZarPoints = PuntosActuales.find((obj) => obj.Id === userId).points;
    ZarPoints += 5;
    let IdWinner;
    IdWinner = CardsWin[0].UserId;
    //! Limpiar Cartas usadas, Cambiar ronda y turno
    const update = await pool.query(
      `UPDATE partida SET Cartas=JSON_ARRAY(),RondaActual=?,Turno=? WHERE Id=?`,
      [newRonda, newZar, partyId]
    );
    //!2 cartas
    if (CardsWin[0].Tipo === 2) {
      console.log("Dos cartas");
      let Ids = [];
      CardsWin.map((obj) => Ids.push(obj.idUser));
      if (Ids[0] !== Ids[1]) {
        console.log("Diferentes");
        let Player1 = 10,
          Player2 = 10;
        Player1 += PuntosActuales.find((obj) => obj.Id === Ids[0]).points;
        Player2 += PuntosActuales.find((obj) => obj.Id === Ids[1]).points;
        const IndexPlayer1 = Players.indexOf(Ids[0]);
        const IndexPlayer2 = Players.indexOf(Ids[1]);
        const updatePoints = await pool.query(
          `UPDATE partida SET Puntos=JSON_SET(JSON_SET(JSON_SET(Puntos,'$[?].points',?),'$[?].points',?),'$[?].points',?)
           WHERE JSON_CONTAINS(Puntos, '{"Id":?}','$') AND JSON_CONTAINS(Puntos, '{"Id":?}','$') AND JSON_CONTAINS(Puntos, '{"Id":?}','$') AND Id=?`,
          [
            IndexActualZar,
            ZarPoints,
            IndexPlayer1,
            Player1,
            IndexPlayer2,
            Player2,
            Zar,
            Ids[0],
            Ids[1],
            partyId,
          ]
        );
        console.log(updatePoints);
        return res.status(201).json({ action: false });
      }
      IdWinner = Ids[0];
    }
    let PlayerPoints = PuntosActuales.find((obj) => obj.Id === IdWinner).points;
    PlayerPoints += 10;
    const IndexPlayer = Players.indexOf(IdWinner);
    const updatePoints = await pool.query(
      `UPDATE partida SET Puntos=JSON_SET(JSON_SET(Puntos, '$[?].points', ?),'$[?].points', ?) 
      WHERE JSON_EXTRACT(Puntos, '$[?].Id')=? AND JSON_EXTRACT(Puntos, '$[?].Id')=? AND Id=?`,
      [
        IndexActualZar,
        ZarPoints,
        IndexPlayer,
        PlayerPoints,
        IndexActualZar,
        Zar,
        IndexPlayer,
        IdWinner,
        partyId,
      ]
    );
    console.log(update);
    res.status(201).json({ action: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//! obtener puntuaciones de los jugadores
export const getPoints = async (req, res) => {
  try {
    const token = req.params.token;
    const Token = jwt.verify(token, secret);
    const partyId = Token.id;
    const [pointsId] = await pool.query(
      `SELECT JSON_EXTRACT(Puntos,'$[*]') AS "Puntos",JSON_LENGTH(Players) AS "Leng" FROM partida WHERE Id=?`,
      [partyId]
    );
    if (pointsId[0].Leng === 0)
      return res.status(400).json({ msg: "Sin puntos" });
    const Puntos = JSON.parse(pointsId[0].Puntos);
    //Extraer los ids
    let Ids = [];
    Puntos.map((player) => Ids.push(player.Id));
    const [nicks] = await pool.query(
      `SELECT Id,Nick, Photo FROM user WHERE Id IN (?)`,
      [Ids]
    );
    let Result = [];
    nicks.map((user) => {
      const Array = Puntos.find((obj) => obj.Id === user.Id);
      if (Array) {
        Result.push({
          Id: user.Id,
          Nick: user.Nick,
          Points: Array.points,
          Photo: user.Photo,
        });
      }
    });
    res.status(200).json(Result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteParty = async (req, res) => {
  try {
    const Token = jwt.verify(req.body.token, secret);
    const partyId = Token.id;
    const userId = Token.userId;
    const [Owner] = await pool.query(
      `SELECT Owner FROM partida WHERE Owner=? AND Id=?`,
      [userId, partyId]
    );
    if (Owner[0].length === 0) return;
    const deleteParty = await pool.query(`DELETE FROM partida WHERE Id=?`, [
      partyId,
    ]);
    res.status(200).json(deleteParty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
