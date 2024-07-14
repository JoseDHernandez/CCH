import { useEffect, useState, useMemo, useRef } from "react";
import { Modal } from "./Modal";
import { Card } from "./Card";
import { Button } from "./Button";
import { socket } from "../api/config.js";
import { useUser } from "../context/User.context";
import {
  getCardsInGame,
  getCardsPlay,
  updatePointsGame,
} from "../api/game.api.js";
import { arraysAreEqual } from "./NumbersRandom";
export const ViewZar = () => {
  const { tokenParty, userData, party } = useUser();
  const Token = tokenParty;
  const NickUser = userData.Nick;
  const IdUser = userData.Id;
  const [cardsOtherPlayers, setCardsOtherPlayers] = useState([]);
  //render Cards select
  const [cardBlack, setCardBlack] = useState([]);
  const [isFull, setIsFull] = useState(false);
  const [frase, setFrase] = useState("");
  const [cards, setCards] = useState([]);
  const [cardsWin, setCardsWin] = useState([]);
  const [butonWin, setButtonWin] = useState(true);
  const [error, setError] = useState(false);
  const [cardsSelect, setCardsSelect] = useState([]);
  async function getCardBlack() {
    try {
      const cards = await getCardsInGame(Token);
      setCardBlack(cards.data.CardB[0]);
    } catch (error) {
      if (error.response.data.message === "jwt expired") return setError(true);
      console.log(error);
    }
  }
  function savedLocalCards(bool) {
    if (cardsOtherPlayers.length === 0) return;
    if (bool) return localStorage.setItem("OPCards", cardsOtherPlayers);
    localStorage.removeItem("OPCards");
  }
  async function winner() {
    let cards;
    if (cardsOtherPlayers[0].Tipo === 2) {
      cards = cardsWin;
    } else {
      cards = [cardsWin];
    }
    if (cardsOtherPlayers[0].Tipo === cards.length && butonWin === false) {
      try {
        const setWinner = await updatePointsGame({
          Cards: cards,
          token: tokenParty,
        });
        if (setWinner.status === 200)
          return socket.emit("client:reloadPage", tokenParty);
        if (setWinner.status === 201) {
          let ac;
          setWinner.data.action == true ? (ac = 1) : (ac = 0);
          console.log("client:finishRound");
          return socket.emit("client:finishRound", {
            token: tokenParty,
            cardBlack: cardBlack,
            cards: cards,
            zar: NickUser,
            frase: frase,
            action: ac,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  function getCardsServerAuto() {
    setInterval(() => {
      console.log("Solicitando cartas del servidor 30s");
      getServerCardsPlay();
    }, 60000);
  }
  async function getServerCardsPlay() {
    try {
      const response = await getCardsPlay(Token);
      if (response.data.length === 0) return console.log("Sin cartas");
      let JsonResponse = [];
      response.data.map((jeson) => JsonResponse.push(JSON.parse(jeson)[0]));
      const iguales = arraysAreEqual(JsonResponse, cardsOtherPlayers);
      if (iguales) {
        return console.log("Cartas iguales");
      }
      setCardsOtherPlayers(JsonResponse);
      //localStorage.setItem("OPCards", cardsOtherPlayers);
    } catch (error) {
      console.log(error);
    }
  }
  const renderCardBlack = () => {
    if (cardBlack.length === 0)
      return <Card body={"Esta carta no a cargado"} color={true} />;
    return <Card body={cardBlack.Texto} color={true} key={cardBlack.Id} />;
  };
  function selectCards(IdCard, IdUser, Tipo, username) {
    const array = cardsOtherPlayers;
    const targetUserId = parseInt(IdUser);
    const targetCardId = parseInt(IdCard);
    function innerFrase(newArray, oldArray) {
      if (newArray.length === 0) return;
      const CBText = cardBlack.Texto;
      if (Tipo) {
        let Text = CBText,
          frase;
        frase = newArray.map(
          (obj) => (Text = Text.replace("___", obj.card.Texto))
        );
        frase = frase[frase.length - 1];
        setFrase(frase);
        if (frase.search("___") === -1) {
          setButtonWin(false);
          setCardsWin(newArray);
        } else {
          setButtonWin(true);
        }
        return;
      }
      if (CBText.lastIndexOf("?") != -1) {
        const frase = CBText + " " + newArray.Texto;
        if (frase.lastIndexOf("_") != -1) {
          setButtonWin(true);
        } else {
          setButtonWin(false);
          setCardsWin(newArray);
        }
        console.log(butonWin);
        setFrase(frase);
        return;
      }
      const result = CBText.replace("___", newArray.Texto);
      if (newArray.Texto == "___") {
        setButtonWin(true);
      } else {
        setButtonWin(false);
        setCardsWin(newArray);
      }
      setFrase(result);
    }
    function changeState(sta, CardId, IdUser) {
      if (Tipo) {
        //Establecer id del usurio si existe IdUser
        const CardUserId = IdUser === undefined ? targetUserId : IdUser;
        // Encontrar el array que contiene el UserId
        let targetArray = array.find((item) => item.UserId == CardUserId);
        if (targetArray === undefined)
          return console.log("Array de cartas no encontrado");
        let targetIndex;
        if (targetArray) {
          // Encontrar el índice del objeto dentro del array
          targetIndex = targetArray.Cards.findIndex(
            (card) => card.Id === CardId
          );
          if (targetIndex === -1) return console.log("carta no encontrada");
          //Cambiar el estado
          targetArray.Cards[targetIndex].State = sta;
        }
        //Actualizar mazo
        setCardsOtherPlayers(array);
        const data = {
          card: targetArray.Cards[targetIndex],
          Tipo: 2,
          Nick: username,
          idUser: targetArray.UserId,
        };
        if (sta === 0) {
          if (cardsSelect.length >= 1) {
            setCardsSelect((l) => [...l, data]);
            return [cardsSelect[0], data];
          } else {
            setCardsSelect([data]);
            return [data];
          }
        } else {
          //Eliminar el objeto de  cardsSelect
          const newArray = cardsSelect.filter((obj) => obj.card.Id !== CardId);
          setCardsSelect(newArray);
          console.log(newArray);
          return [newArray[0], { card: { Texto: "___" } }];
        }
      } else {
        const targetCard = array.find((item) => item.Id === CardId);
        targetCard.State = sta;
        const newArray = array.map((card) => {
          if (card.Id === CardId) return targetCard;
          return card;
        });
        setCardsOtherPlayers(newArray);
        setCardsSelect(targetCard);
        return targetCard;
      }
    }
    if (Tipo) {
      if (cardsSelect.length >= 1) {
        const filtro = cardsSelect.find((obj) => obj.card.Id === targetCardId);
        console.log(filtro);
        if (filtro !== undefined) {
          console.log("igual");
          const newArray = changeState(1, targetCardId);
          innerFrase(newArray);
          return;
        }
        if (cardsSelect.length === 2) {
          changeState(1, cardsSelect[0].card.Id, cardsSelect[0].idUser);
          const newArray = changeState(0, targetCardId);
          innerFrase(newArray);
          return;
        }
        const newArray = changeState(0, targetCardId);
        innerFrase(newArray);
        return;
      }
      const newArray = changeState(0, targetCardId);
      innerFrase(newArray);
    } else {
      const CardSave = cardsSelect.Id;
      if (CardSave != undefined) {
        if (CardSave === targetCardId) {
          changeState(0, targetCardId);
          innerFrase({ Texto: "___" });
          setCardsSelect([]);
          return;
        } else if (CardSave != targetCardId) {
          changeState(0, CardSave);
        }
      }
      const Text = changeState(1, targetCardId);
      innerFrase(Text);
    }
  }
  const renderOtherCards = () => {
    if (cardsOtherPlayers.length === 0)
      return (
        <Card
          body={"No hay cartas de otros jugadores"}
          className={"scale-75"}
        />
      );
    if (cardsOtherPlayers[0].Tipo === 2) {
      return cardsOtherPlayers.map((cards) =>
        cards.Cards.map((card) => (
          <div key={card.Id}>
            <Card
              body={card.Texto}
              onClick={() =>
                selectCards(card.Id, cards.UserId, true, cards.Nick)
              }
            />
            <div
              className={`flex justify-center mt-2 ${
                card.State === 0 ? "block" : "hidden"
              }`}
            >
              <Button
                text={"Seleccionar"}
                className={`  ${card.State === 0 && "animated fadeInUp"}`}
                Disable={butonWin}
                onClick={() => winner()}
              />
            </div>
          </div>
        ))
      );
    }
    return cardsOtherPlayers.map((card) => (
      <div key={card.Id}>
        <Card
          body={card.Texto}
          onClick={() => selectCards(card.Id, card.UserId)}
        />
        <div
          className={`flex justify-center mt-2 ${
            card.State === 1 ? "block" : "hidden"
          }`}
        >
          <Button
            text={"Seleccionar"}
            className={` animated ${card.State === 1 ? " fadeInUp" : " "}`}
            Disable={butonWin}
            onClick={() => winner()}
          />
        </div>
      </div>
    ));
  };
  function getOtherCards() {
    socket.on("server:Game", (data) => {
      console.log(data);
      if (data.length === 0) return;
      // data = JSON.parse(data);
      console.log(data);
      setCardsOtherPlayers((before) => [...before, data]);
      savedLocalCards(true);
    });
  }
  function exit() {
    party(false, false);
    localStorage.removeItem("OPCards");
    localStorage.removeItem("otherCards");
    localStorage.removeItem("cardsPlayer");
    localStorage.removeItem("inRoom");
    localStorage.removeItem("inGame");
    window.location.href = "/";
  }
  useEffect(() => {
    getCardBlack();
    getOtherCards();
    // getCardsServerAuto();
    return () => {
      socket.off("server:Game");
    };
  }, []);
  return (
    <>
      {error && (
        <Modal
          modalContent={
            <p className="text-2xl">Datos de la partida expirados.</p>
          }
          showModal={error}
          butonCustom={
            <Button onClick={() => exit()} text={"Volver al menu"} />
          }
        />
      )}
      <Button text={"Actualizar cartas"} onClick={() => getServerCardsPlay()} />
      <div className="grid grid-cols-7  gap-5 mb-5">
        {renderCardBlack()}

        <div className="col-span-6">
          <p className="text-4xl p-2">{frase ? frase : cardBlack.Texto}</p>
        </div>
      </div>
      <div
        className=" flex overflow-x-auto space-x-8 w-full h-96 
      bg-gray-200 rounded-xl p-1"
      >
        {renderOtherCards()}
      </div>
    </>
  );
};

export default ViewZar;
