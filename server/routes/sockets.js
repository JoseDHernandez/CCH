import jwt from "jsonwebtoken";
import { secret } from "../config.js";
import {
  validateNumber,
  validatePassword,
  validateTitle,
  codeParty,
} from "../middlewares/userRegex.js";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
export default (io) => {
  io.sockets.on("connection", (socket) => {
    //! Lista de partidas
    const listPartys = async () => {
      try {
        const [response] = await pool.query(
          `SELECT Nombre,partida.Id,Nick,Photo,JSON_LENGTH(Players) AS 'Players',estado.Estado AS "Estado",Rondas,LimitePlayers,RondaActual,Codigo, CASE WHEN partida.Password = NULL THEN NULL ELSE partida.Password END AS "Password" FROM partida INNER JOIN user ON user.Id = Owner INNER JOIN estado ON estado.Id = partida.Estado LIMIT 0,30`
        );
        if (response.length === 0) {
          return socket.emit("server:listPartys", {
            message: "No hay partidas encontradas.",
            status: 204,
          });
        }
        io.emit("server:listPartys", response);
      } catch (error) {
        socket.emit("listPartysError", { message: error.message });
      }
    };
    listPartys();
    //! Crear partida
    socket.on("client:createParty", async (data) => {
      try {
        const Nombre = data.Nombre.trim();
        const Players = data.Players.trim();
        const Rondas = data.Rondas;
        const Tipo = data.Tipo;
        const Password = data.Password.trim();
        const OwnerId = data.Id;
        const SockId = data.SockId;
        let Datos = {
          Estado: "",
          Password: "",
        };
        if (Tipo === true) {
          if (!validatePassword(Password)) {
            socket.emit("createPartyError", "Error en la clave de la partida.");
          }
          Datos.Password = await bcrypt.hash(Password, 13);
          Datos.Estado = 5;
        } else {
          Datos.Password = null;
          Datos.Estado = 1;
        }
        if (
          validateNumber(Players) &&
          Players >= 3 &&
          Players <= 15 &&
          validateNumber(Rondas) &&
          Rondas >= 4 &&
          Rondas <= 50 &&
          validateNumber(OwnerId) &&
          validateTitle(Nombre)
        ) {
          //*Verificar si tiene una partida ya creada, si exite eliminarla y crear la nueva
          const [queryParty] = await pool.query(
            `SELECT partida.Id, Nick FROM partida INNER JOIN user ON user.Id = Owner WHERE Owner=?`,
            [OwnerId]
          );
          if (queryParty.length >= 1) {
            const [deleteParty] = await pool.query(
              `DELETE FROM partida WHERE Id=?`,
              [queryParty[0].Id]
            );
          }
          let Codigo = codeParty();
          const DateCreated = Date.now();
          const [newParty] = await pool.query(
            `INSERT INTO partida (Nombre,Owner,Players,Estado,Rondas,LimitePlayers,Codigo,Password,KickPlayers) VALUES (?,?,JSON_ARRAY(?),?,?,?,?,?,JSON_ARRAY())`,
            [
              Nombre,
              OwnerId,
              OwnerId,
              Datos.Estado,
              Rondas,
              Players,
              Codigo,
              Datos.Password,
            ]
          );
          const token = jwt.sign(
            { code: Codigo, id: newParty.insertId, userId: OwnerId },
            secret,
            {
              expiresIn: 18000, //5 minutos
            }
          );
          socket.join(Codigo); //Agergar sala a salas
          io.to(Codigo).emit("server:partyCreated", {
            Code: Codigo,
            Token: token,
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
    //! Unirse a la partida (Agregar jugador a la lista de Players)
    socket.on("client:joinParty", async (data) => {
      try {
        const Codigo = data.code;
        const IdUser = data.Id;
        const [queryPlayers] = await pool.query(
          `SELECT Id,JSON_EXTRACT(Players,'$') AS 'Players',LimitePlayers, JSON_EXTRACT(KickPlayers,'$') AS "Kicks",Estado FROM partida WHERE Codigo=?`,
          [Codigo]
        );
        if (queryPlayers[0] === null || queryPlayers[0] === undefined)
          return socket.emit("server:joinParty", {
            message: "Partida no encontrada",
            error: 404,
          });
        else if (queryPlayers[0].Players === queryPlayers[0].LimitePlayers)
          return socket.emit("server:joinParty", {
            message: "Partida llena",
            error: 400,
          });
        /* if (queryPlayers[0].Estado === 2) {
          return socket.emit("server:joinParty", {
            message: "Partida en juego",
            error: 400,
          });
        } */
        if (queryPlayers[0].Kicks.length > 0) {
          const JsonKicks = JSON.parse(queryPlayers[0].Kicks);
          if (JsonKicks.findIndex((obj) => obj === IdUser) !== -1) {
            return socket.emit("server:joinParty", {
              message: "No eres acceptado en la partida.",
              error: 400,
            });
          }
        }
        const token = jwt.sign(
          { code: Codigo, id: queryPlayers[0].Id, userId: IdUser },
          secret,
          {
            expiresIn: 18000, //5 horas.
          }
        );
        //Si el jugador ya esta en la lista de jugadores, re enviar el token para el reingreso

        console.log(queryPlayers[0].Players);
        const Players = JSON.parse(queryPlayers[0].Players);
        console.log(Players.length);
        if (Players.find((id) => id === IdUser) !== undefined) {
          socket.join(Codigo);
          return io.to(Codigo).emit("server:joinParty", token);
        }
        const [addPlayer] = await pool.query(
          `UPDATE partida SET Players=JSON_ARRAY_APPEND(Players,'$',?) WHERE Id=?`,
          [IdUser, queryPlayers[0].Id]
        );
        socket.join(Codigo);
        io.to(Codigo).emit("server:joinParty", token);
      } catch (error) {
        console.log(error);
      }
    });
    //! Lista de jugadores de en la sala
    socket.on("client:listPlayers", async (data) => {
      try {
        const room = jwt.verify(data, secret);
        const Code = room.code;
        const roomId = room.id;
        const [players] = await pool.query(
          `SELECT user.Nick, user.Photo,user.Id, CASE WHEN partida.Owner = user.Id THEN 'TRUE' ELSE 'FALSE' END AS 'Owner' FROM user INNER JOIN partida ON JSON_CONTAINS(partida.Players, JSON_ARRAY(user.Id) , '$') WHERE partida.Id=${roomId}`
        );
        const [owner] = await pool.query(
          `SELECT Owner AS Id_Owner FROM partida WHERE partida.Id=${roomId}`
        );
        socket.join(Code);
        io.to(Code).emit("server:listPlayers", { owner, players });
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          console.log("El token ha expirado.");
        } else {
          console.log("listPlayers Error: ");
          console.log(error);
        }
      }
    });
    //! Chat
    socket.on("client:chat", (data) => {
      try {
        let message = data.msg;
        const nick = data.nick;
        const photo = data.photo;
        const room = jwt.verify(data.token, secret);
        const Code = room.code;
        if (message.length >= 250) {
          message = message.substring(0, 250);
        }
        const regex = new RegExp(/^[a-zA-ZÀ-ÿ0-9.,"'\s+]{3,250}$/);
        if (regex.test(message)) {
          io.to(Code).emit("server:chat", { message, nick, photo });
        }
      } catch (error) {
        console.log("Chat Error: ");
        console.log(error);
      }
    });
    //! Reload
    socket.on("client:reloadPage", (token) => {
      try {
        const room = jwt.verify(token, secret);
        const Code = room.code;
        io.to(Code).emit("server:reloadPage", true);
      } catch (error) {
        console.log("Chat ReloadPage: ");
        console.log(error);
      }
    });
    //! Iniciar juego
    socket.on("client:onGame", (code) => {
      try {
        const Code = code;
        console.log("Code " + Code);
        io.to(Code).emit("server:onGame", true);
      } catch (error) {
        console.log("on Game: ");
        console.log(error);
      }
    });
    //! Canal de cartas del juego
    socket.on("client:Game", async (data) => {
      console.log("Canal de cartas");
      try {
        const Token = jwt.verify(data.token, secret);
        const Code = Token.code;
        let cardsPlay = JSON.parse(data.cardsData);
        cardsPlay = cardsPlay[0];
        io.to(Code).emit("server:Game", cardsPlay);
      } catch (error) {
        console.log("Game: ");
        console.log(error);
      }
    });
    //! Final de la ronda
    socket.on("client:finishRound", (data) => {
      try {
        const Token = jwt.verify(data.token, secret);
        const Code = Token.code;
        const datas = {
          cardBlack: data.cardBlack,
          cards: data.cards,
          zar: data.zar,
          frase: data.frase,
          action: data.action,
        };
        console.log("server => client:finishRound " + Code);
        io.to(Code).emit("server:finishRound", datas);
      } catch (error) {
        console.log(error);
      }
    });
    //! Expulsar jugador
    socket.on("client:KickPlayer", async (data) => {
      try {
        const Token = jwt.verify(data.token, secret);
        const partyId = Token.id;
        const Code = Token.code;
        const playerId = data.playerId;
        if (playerId === Token.userId) return;
        const [response] = await pool.query(
          `SELECT JSON_EXTRACT(Players, '$') AS "Players" FROM partida WHERE Id=?`,
          [partyId]
        );
        const JsonPlayers = JSON.parse(response[0].Players);
        const indexUser = JsonPlayers.indexOf(playerId);
        if (indexUser === -1) return;
        const Kick = await pool.query(
          `UPDATE partida SET Players=JSON_REMOVE(Players, '$[?]'), KickPlayers = JSON_ARRAY_APPEND(KickPlayers, '$',?) WHERE Id=?`,
          [indexUser, playerId, partyId]
        );
        io.to(Code).emit("server:KickPlayer", playerId);
      } catch (error) {
        console.log(error);
      }
    });
  });
};
