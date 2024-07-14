import { useEffect, useState, useMemo, useRef } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { socket } from "../api/config";
import { useUser } from "../context/User.context";
import { Modal } from "./Modal";
import {
  getCardsInGame,
  updateCardsInGame,
  saveCardsInGame,
  uploadCardsPlay,
} from "../api/game.api";

export const ViewPlayer = () => {
  const { tokenParty, userData, party } = useUser();
  const [error, SetError] = useState(false);
  const Token = tokenParty;
  const NickUser = userData.Nick;
  const IdUser = userData.Id;
  const [cardsPlayer, setCardsPlayer] = useState([]);
  const [cardBlack, setCardBlack] = useState([]);
  const [otherCards, setOtherCards] = useState([]);
  const [cardsOtherPlayers, setCardsOtherPlayers] = useState([]);
  //render Cards select
  const [isFull, setIsFull] = useState(false);
  const [cards, setCards] = useState([]); //Cartas seleccionadas
  function removeCArdsLocal() {
    localStorage.removeItem("viewCards");
    localStorage.removeItem("cardsPlayer");
    localStorage.removeItem("otherCards");
    window.location.reload();
  }
  async function getCards() {
    try {
      const CP = JSON.parse(localStorage.getItem("cardsPlayer"));
      const CO = JSON.parse(localStorage.getItem("otherCards"));
      const cards = await getCardsInGame(Token);

      const CardWhite = cards.data.CardsW;
      const CardsPlayer = CardWhite.slice(0, 10);
      //Verificar cartas guardadas
      if (CP != null && CP.length > 0 && CO.length > 0) {
        setCardsPlayer(CP);
        setOtherCards(CO);
      } else {
        setCardsPlayer(CardsPlayer);
        setOtherCards(CardWhite.slice(10)); //Cartas de reserva
      }
      setCardBlack(cards.data.CardB[0]);
    } catch (error) {
      console.log(error);
      if (error.response.data.message === "jwt expired") return SetError(true);
    }
  }
  async function handleAddCards(data) {
    try {
      const newCards = await addCards(cardsPlayer, otherCards, cards, data);
      setCardsPlayer(newCards.newCardsPlayer);
      setOtherCards(newCards.newOtherCards);
    } catch (error) {
      console.log(error);
    }
  }
  async function addCards(
    arrayCardsPlayer,
    arrayCards,
    arrayCardsID,
    cardsSelect
  ) {
    //Verificar si hay cartas suficientes de reserva
    if (arrayCards.length < arrayCardsID.length) {
      try {
        //Generar nuevas cartas de reserva
        const response = await updateCardsInGame(Token);
        console.log("response NewCards");
        console.log(response);
        arrayCards = response.data;
      } catch (error) {
        console.log(error);
      }
    }
    let indexs = [];
    arrayCardsID.map((card) => indexs.push(card.Id));
    //Array sin los objetos indicados
    function removeCardsPlayer(array, id) {
      return array.filter((arr) => arr.Id !== id);
    }
    //Agregar cartas
    function addCardsToCardsPlayer(arrayCardsPlayer, arrayCards) {
      arrayCards.forEach((element) => arrayCardsPlayer.push(element));
    }
    //recorrer los ids para quitarlos
    indexs.forEach((Id) => {
      arrayCardsPlayer = removeCardsPlayer(arrayCardsPlayer, Id);
    });
    //Extraer las dos primeras cartas de otherCards
    let ind = [0, 1],
      addCards = [];
    if (arrayCardsID.length === 2) {
      ind.forEach((index) => addCards.push(arrayCards[index]));
    } else {
      addCards.push(arrayCards[0]);
    }
    //Nuevo array de cartas jugables (arrayCardsPlayer)
    addCardsToCardsPlayer(arrayCardsPlayer, addCards);
    //Array de cartas de reserva sin las que se pasaron (arrayCards)
    arrayCards = arrayCards.slice(2);
    //Guardar mazo
    try {
      const cards = arrayCardsPlayer.concat(arrayCards);
      const saved = await saveCardsInGame({ Cards: cards, token: Token });
      if (saved.status !== 201)
        return console.log("Error en el guardado de cartas");
      console.log(saved.status);
      console.log("Guardando carta selecionada");
      const upload = await uploadCardsPlay(cardsSelect);
      if (upload.status === 201) console.log("Carta guardada");
      console.log(upload);
      //Guardar cartas en el almacenamiento
      /*  */
      localStorage.setItem("viewCards", JSON.stringify(arrayCardsID));
      localStorage.setItem("cardsPlayer", JSON.stringify(arrayCardsPlayer));
      localStorage.setItem("otherCards", JSON.stringify(arrayCards));
      //Devolver los valores de las nuevas cartas para renderizar
      return { newCardsPlayer: arrayCardsPlayer, newOtherCards: arrayCards };
    } catch (error) {
      console.log(error);
    }
  }
  const shareCardsCalledRef = useRef(false);
  const shareCards = useMemo(async () => {
    const tipo = cardBlack.Tipo === 2 ? cardBlack.Tipo : 1;
    if (isFull && cards.length === tipo && !shareCardsCalledRef.current) {
      let obj, Cards;
      if (tipo === 1) {
        obj = {
          Tipo: tipo,
          Id: cards[0].Id,
          Texto: cards[0].Texto,
          Nick: userData.Nick,
          State: 0,
          UserId: userData.Id,
        };
        Cards = JSON.stringify([obj]);
      } else {
        obj = {
          Tipo: tipo,
          Cards: cards,
          Nick: userData.Nick,
          UserId: userData.Id,
        };
        Cards = JSON.stringify([obj]);
      }
      const data = {
        token: Token,
        cardsData: Cards,
      };
      socket.emit("client:Game", data);
      handleAddCards(data);
      shareCardsCalledRef.current = true;
    }
  }, [isFull, cards, cardBlack.Tipo, Token]);
  const startDrag = (evt, item) => {
    evt.dataTransfer.setData("itemID", item.Id);
  };
  const dragginOver = (e) => {
    e.preventDefault();
  };
  const onDrop = (evt, st) => {
    if (isFull) return console.log("lleno");
    const itemID = evt.dataTransfer.getData("itemID");
    const item = cardsPlayer.find((card) => card.Id === parseInt(itemID));
    item.State = st;
    const newState = cardsPlayer.map((card) => {
      if (card.Id == itemID) return item;
      return card;
    });
    setCardsPlayer(newState);
  };
  const filterCards = (status) => {
    return cardsPlayer.filter((e) => e.State === status);
  };
  function renderCardsPlayer() {
    try {
      if (cardsPlayer.length === 0)
        return <Card body={"Sin cartas, recarga la pagina."} />;
    } catch (error) {
      console.log(cardsPlayer.length);
    }

    return filterCards(0).map((card) => (
      <Card
        body={card.Texto}
        key={card.Id}
        isDraggable={true}
        onDragStart={(e) => startDrag(e, card)}
      />
    ));
  }
  //Funcion de salir
  function exit() {
    party(false, false);
    localStorage.removeItem("OPCards");
    localStorage.removeItem("otherCards");
    localStorage.removeItem("cardsPlayer");
    localStorage.removeItem("inRoom");
    localStorage.removeItem("inGame");
    window.location.href = "/";
  }
  const renderCardBlack = () => {
    if (cardBlack.length === 0)
      return <Card body={"Esta carta no a cargado"} color={true} />;
    return <Card body={cardBlack.Texto} color={true} key={cardBlack.Id} />;
  };
  const renderCardsSelect = () => {
    const CV = JSON.parse(localStorage.getItem("viewCards"));
    if (CV != null && CV.length > 0) {
      console;
      return CV.map((card) => <Card key={card.Id} body={card.Texto} />);
    }
    if (isFull) {
      shareCards;
      return cards.map((card) => <Card key={card.Id} body={card.Texto} />);
    }

    if (cardsPlayer.length === 0) {
      return <Card body={"Cartas no cargadas"} />;
    }

    const cardsPlay = filterCards(1);
    const placeSholder = [
      "¿Cuál será tu próxima carta?",
      "1° Carta",
      "2° Carta",
    ];
    if (cardBlack.Tipo === 2 && cardsPlay.length <= 2) {
      const selectedCards = cardsPlay.map((card) => (
        <Card key={card.Id} body={card.Texto} />
      ));
      if (cardsPlay.length === 0) {
        return (
          <>
            <Card body={placeSholder[1]} />
            <Card body={placeSholder[2]} />
          </>
        );
      }
      if (cardsPlay.length === 1) {
        return (
          <>
            {selectedCards}
            <Card body={placeSholder[2]} />
          </>
        );
      } else {
        setIsFull(true);
        setCards(cardsPlay);
        return <>{selectedCards}</>;
      }
    }
    if (cardsPlay.length === 1) {
      setIsFull(!isFull);
      setCards(cardsPlay);
      return <Card body={cardsPlay[0].Texto} />;
    }

    return <Card body={placeSholder[0]} />;
  };

  function getOtherCards() {
    socket.on("server:Game", (data) => {
      //data = JSON.parse(data);
      if (data.length === 0) return;
      setCardsOtherPlayers((before) => [...before, data]);
    });
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
          <Card
            body={card.Texto}
            key={card.Id}
            className={card.UserId === IdUser ? "hidden" : "scale-75"}
          />
        ))
      );
    }
    return cardsOtherPlayers.map((card, index) => (
      <Card
        body={card.Texto}
        key={card.Id ? card.Id : index}
        className="scale-75"
      />
    ));
  };
  useEffect(() => {
    getCards();
    getOtherCards();
    shareCards;
    return () => {
      socket.off("server:Game");
    };
  }, [shareCards]);
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
      <Button
        onClick={() => removeCArdsLocal()}
        text={"Limpiar cartas locales"}
      />
      <div
        className="grid 
      grid-cols-7  gap-5 mb-5 mt-3"
      >
        {renderCardBlack()}

        <div
          className={`col-span-2 grid gap-5 grid-cols-2 bg-gray-100 rounded-xl border-2 border-gray-300 ${
            isFull && "opacity-50"
          }`}
          onDragOver={(e) => dragginOver(e)}
          onDrop={(e) => onDrop(e, 1)}
        >
          {renderCardsSelect()}
        </div>
        <div className="bg-gray-300 rounded-xl border-2 border-gray-600 col-span-4 flex overflow-x-auto  w-full">
          {renderOtherCards()}
        </div>
      </div>
      <div className="flex overflow-x-auto sm:p-1 md:p-2 xl:p-3 2xl:p-4 sm:space-x-1 md:space-x-2 xl:space-x-4 2xl:space-x-8 md:rounded-lg  xl:rounded-xl w-full bg-gray-200 ">
        {renderCardsPlayer()}
      </div>
    </>
  );
};

export default ViewPlayer;
