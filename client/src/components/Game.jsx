import { useEffect, useState, useMemo, useRef } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { socket } from "../api/config";
import { ViewZar } from "./Zar";
import { ViewPlayer } from "./Player";
import { Modal } from "./Modal";
import { getPoints, deleteParty } from "../api/game.api";
export const Game = ({ Title, isZar, isOwner, Token, Ronda }) => {
  const [finsh, setFinish] = useState(false);
  const [datos, setDatos] = useState([]);
  const [puntos, setPuntos] = useState([]);
  const [error, setError] = useState(false);
  function clear() {
    localStorage.removeItem("finnish");
    localStorage.removeItem("OPCards");
    localStorage.removeItem("otherCards");
    localStorage.removeItem("cardsPlayer");
    localStorage.removeItem("viewCards");
  }
  function exit() {
    clear();
    localStorage.removeItem("inGame");
    localStorage.removeItem("inRoom");
    localStorage.removeItem("tokenParty");
    localStorage.removeItem("codeParty");
    window.location.href = "/";
  }
  function next() {
    clear();
    window.location.reload();
  }
  function autoNext() {
    setTimeout(() => {
      return next();
    }, 30000);
  }
  async function fin() {
    try {
      const deleteRoom = await deleteParty(Token);
      if (deleteRoom.status === 200) {
        clear();
        localStorage.removeItem("inGame");
        localStorage.removeItem("inRoom");
        localStorage.removeItem("tokenParty");
        localStorage.removeItem("codeParty");
      }
      console.log(deleteRoom);
    } catch (error) {
      console.log(error);
    }
  }
  async function points() {
    try {
      const response = await getPoints(Token);
      if (response.status === 200) return setPuntos(response.data);
    } catch (error) {
      if (error.response.data.message === "jwt expired") return setError(true);
      console.log(error);
    }
  }
  function renderPoints() {
    if (puntos.length === 0) return <h2>Sin puntos</h2>;
    return puntos.map((user) => (
      <div
        key={user.Id}
        className="grid grid-cols-3 grid-rows-2  gap-x-5 my-3 p-2 rounded-md shadow-md bg-white"
      >
        <img
          className="col-span-1 row-span-2 w-80 h-32 object-cover border-2 border-black rounded-xl"
          alt="Photo user"
          src={user.Photo}
        />
        <p className="col-span-2 text-4xl">{user.Nick}</p>
        <p className="text-2xl">
          <b>Puntos </b>
          {user.Points}
        </p>
      </div>
    ));
  }
  function renderPlayersWin() {
    if (datos.action !== 1)
      if (datos.cards.length === 0) return <h2>Sin datos</h2>;
    if (datos.cards[0].Tipo === 2) {
      return datos.cards.map((card) => (
        <p key={card.UserId}>
          <b>Ganador: </b>
          {card.Nick}
        </p>
      ));
    } else {
      return datos.cards.map((card) => (
        <p key={card.UserId}>
          <b>Ganador: </b>
          {card.Nick}
        </p>
      ));
    }
  }
  function renderCardsWin() {
    if (datos.cards.length === 0) return <h2>Sin cartas</h2>;
    if (datos.cards[0].Tipo === 2) {
      return datos.cards.map((card) => (
        <Card body={card.card.Texto} key={card.Id} />
      ));
    } else {
      return datos.cards.map((card) => (
        <Card body={card.Texto} key={card.Id} />
      ));
    }
  }
  useEffect(() => {
    if (localStorage.getItem("finnish") !== null) {
      const data = JSON.parse(localStorage.getItem("finnish"));
      //console.log(data);
      setDatos(data);
      points();
      return setFinish(true);
    } else {
      setFinish(false);
      clear();
    }
    socket.on("server:finishRound", (data) => {
      console.log(data);
      if (data != null || data != undefined) {
        if (data.action === 0) {
          autoNext();
        }
        setFinish(true);
        setDatos(data);
        points();
        const jsonData = JSON.stringify(data);
        clear();
        localStorage.setItem("finnish", jsonData);
      }
    });
    return () => {
      socket.off("server:finishRound");
    };
  }, []);
  return (
    <>
      {error && (
        <Modal
          showModal={error}
          modalContent={
            <p className="text-2xl">Datos de la partida expirados.</p>
          }
          butonCustom={
            <Button
              text={"Volver al menu"}
              onClick={() => {
                clear();
                window.location.href = "/";
              }}
            />
          }
        />
      )}
      <h1 className="mb-5">
        <b className="text-white bg-black rounded-md p-2">{Ronda}</b> {Title}
      </h1>
      <div className={`${finsh ? "block" : "hidden"}`}>
        {finsh && (
          <>
            <div className="grid grid-cols-4 bg-gray-200 p-4 rounded-4 h-screen">
              <p className="col-span-3 text-5xl">"{datos.frase}"</p>

              <div className="row-span-3">{renderPoints()}</div>
              <div className="col-span-3 p-5 text-3xl">
                <b>Zar:</b> {datos.zar}
                <br />
                {renderPlayersWin()}
              </div>
              <div className="col-span-3 flex gap-2">
                <Card
                  body={datos.cardBlack.Texto}
                  key={datos.cardBlack}
                  color={true}
                />
                {renderCardsWin()}
              </div>
              {}
              <div>
                <Button
                  onClick={datos.action === 1 ? () => exit() : () => next()}
                  text={datos.action === 1 ? "Salir" : "Siguiente ronda"}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <div className={finsh === false ? "block" : "hidden"}>
        {isZar ? <ViewZar /> : <ViewPlayer />}
      </div>
    </>
  );
};

export default Game;
