import { useState, useEffect, useMemo } from "react";
import { socket } from "../api/config";
import { useUser } from "../context/User.context";
import { Modal } from "../components/Modal";
import { Loader } from "../components/Loader";
import { validatePassword } from "../components/Regex";
import { Button } from "../components/Button";
import {
  partyData,
  partyPassword,
  startGame,
  getNumbersCards,
} from "../api/game.api";
import { Chat } from "../components/Chat";
import { ConfigInParty } from "../components/ConfigInParty";
import { Game } from "../components/Game";
const Partida = () => {
  const { codeParty, tokenParty, party, userData } = useUser();
  const [listplayers, setListplayers] = useState("");
  const [loader, setLoader] = useState(false);
  const [modal, setModal] = useState(true);
  const [text, setText] = useState({ Error: false, Text: "" });
  const [Password, setPassword] = useState("");
  const [owner, setOwner] = useState("");
  const [players, setPlayers] = useState("1");
  const [startG, setStartGame] = useState(false);
  // game
  const [inGame, setInGame] = useState(localStorage.getItem("inGame") ?? false);
  function game(value) {
    if (value) {
      localStorage.setItem("inGame", value);
      setLoader(false);
    } else {
      localStorage.removeItem("inGame");
    }
  }
  async function Playgame() {
    try {
      const data = {
        Token: tokenParty,
      };
      const response = await startGame(data);
      console.log(response.data);
      if (response.status === 201) {
        console.log("OK");
        socket.emit("client:onGame", codeParty);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
    }
    console.log(inGame);
    if (inGame === false && text.Error === false) {
      setLoader(true);
      try {
        const cardsN = await getNumbersCards();
        const MaxCardBlack = cardsN.data.MaxCardBlack;
        const MaxCardWhite = cardsN.data.MaxCardWhite;
        //CardsWhite.shift();
        const data = {
          CBlack: MaxCardBlack,
          CWhite: MaxCardWhite,
          Token: tokenParty,
        };
        const response = await startGame(data);
        if (response.status === 201) {
          console.log("OK");
          socket.emit("client:onGame", codeParty);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  function StartGame() {
    setStartGame(true);
  }
  function exit() {
    Room();
    game(false);
    party(false, false);
    localStorage.removeItem("OPCards");
    localStorage.removeItem("otherCards");
    localStorage.removeItem("cardsPlayer");
    window.location.href = "/";
  }
  function getPlayers(token) {
    socket.emit("client:listPlayers", token);
    socket.on("server:listPlayers", (data) => {
      setListplayers(data.players);
      setOwner(data.owner[0].Id_Owner);
    });
  }
  function Kickplayer(id) {
    console.log(id);
    socket.on("client:KickPlayer", {
      playerId: id,
      token: tokenParty,
    });
  }
  const renderlistPlayers = () => {
    if (listplayers.length === 0) return <h3>Error</h3>;
    return (
      <>
        <h2
          className={`p-2 text-center rounded-lg border-black border-2 ${
            listplayers.length === text.Text.LimitePlayers
              ? "text-white bg-black"
              : " bg-white"
          }`}
        >
          Jugadores {listplayers.length + " / " + text.Text.LimitePlayers}
        </h2>
        {listplayers.map((player) => (
          <div
            key={player.Id}
            className="grid grid-cols-3 grid-rows-2  gap-x-5 my-3"
          >
            <img
              src={`${player.Photo}`}
              alt="User photo"
              className="col-span-1 row-span-2 w-80 h-32 object-cover border-2 border-black rounded-xl"
            />

            <h4
              className={`col-span-2 text-4xl ${
                player.Id === userData.Id && "text-gray-600"
              }`}
            >
              {player.Nick}
            </h4>

            {player.Owner === "TRUE" ? (
              <div>
                <Button
                  text={"Creador"}
                  Disable={true}
                  className="bg-black text-white"
                />
              </div>
            ) : (
              ""
            )}

            {owner === userData.Id ? (
              player.Owner === "FALSE" ? (
                <div>
                  <Button
                    className="bg-red-700"
                    text={"Expulsar"}
                    onClick={() => Kickplayer(player.Id)}
                  />
                </div>
              ) : (
                ""
              )
            ) : (
              ""
            )}
          </div>
        ))}
      </>
    );
  };
  const renderPlayers = useMemo(renderlistPlayers, [listplayers]);
  const [inRoom, setInRoom] = useState(localStorage.getItem("inRoom") ?? false);
  function clearLocal() {
    localStorage.removeItem("inGame");
    localStorage.removeItem("finnish");
    localStorage.removeItem("OPCards");
    localStorage.removeItem("otherCards");
    localStorage.removeItem("cardsPlayer");
    localStorage.removeItem("viewCards");
  }
  function Room(value) {
    if (value) {
      localStorage.setItem("inRoom", value);
      window.location.reload();
    } else {
      localStorage.removeItem("inRoom");
    }
  }
  function join() {
    const socketId = socket.id;
    const data = { sockId: socketId, Id: userData.Id, code: codeParty };
    socket.emit("client:joinParty", data);
    socket.on("server:joinParty", (token) => {
      if (token.error === 404 || token.error === 400) {
        setText({ Error: true, Text: token.message });
        return setModal(true);
      }
      clearLocal();
      party(codeParty, token);
      Room(true);
      setModal(false);
    });
  }
  async function getDataParty() {
    try {
      const response = await partyData(codeParty);
      if (response.request.status === 200) {
        setText({ Error: false, Text: response.data });
      }
    } catch (error) {
      switch (error.request.status) {
        case 400:
          setText({ Error: true, Text: "Codigo de partida invalido." });
          break;
        case 401:
          setText({
            Error: true,
            Text: "Sin acceso, vuelve a iniciar sesión.",
          });
          break;
        case 404:
          setText({ Error: true, Text: "Partida no encontrada." });
          break;
      }
      setModal(true);
    }
  }
  function Share() {
    console.log(codeParty);
  }
  async function submit() {
    try {
      if (!validatePassword(Password))
        return console.error("Contrasena invalida");
      const data = { Code: codeParty, Password: Password, Id: userData.Id };
      const response = await partyPassword(data);
      if (response.request.status === 200) {
        party(response.data.Code, response.data.Token);
        Room(true);
        setModal(false);
      }
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    socket.on("server:KickPlayer", (playerId) => {
      if (playerId === userData.Id) {
        setText({
          Error: true,
          Text: "Expulsado por ___. Te expulsaron de la partida.",
        });
        setModal(true);
        return;
      }
    });
    socket.on("server:reloadPage", (bool) => {
      if (bool === true) {
        window.location.reload();
      }
    });
    socket.on("server:onGame", (bool) => {
      if (bool === true) {
        clearLocal();
        game(true);
        window.location.reload();
        console.log("en juego");
      }
    });
    getDataParty();
    if (inRoom && tokenParty != "false") {
      setModal(false);
      getPlayers(tokenParty);
      if (localStorage.getItem("inGame") === "true" || text.Text.Sta == 2) {
        game(true);
      }
    } else {
      setModal(true);
    }
  }, []);
  return (
    <>
      {startG && (
        <Modal
          modalContent={
            <p className="text-3xl">¿Quieres iniciar la partida?</p>
          }
          showModal={startG}
          butonCustom={
            <>
              <Button text={"Iniciar"} onClick={() => Playgame()} />{" "}
              <Button
                text={"Cancelar"}
                onClick={() => setStartGame(false)}
                className={"float-right"}
              />
            </>
          }
        />
      )}
      <Loader loaderShow={loader} />
      <Modal
        modalContent={
          text.Error ? (
            <p className="text-3xl">{text.Text}</p>
          ) : (
            <div>
              {" "}
              <h3>{text.Text.Nombre}</h3>
              <p>
                <strong>Creador: </strong>
                {text.Text.Nick}
              </p>
              <p>
                <strong>Jugadores: </strong>
                {text.Text.Players} / {text.Text.LimitePlayers}
              </p>
              <p>
                <strong>Rondas: </strong>
                {text.Text.Rondas}
              </p>
              {!text.Text.Password ? (
                <input
                  className=" p-1 rounded-2 border-black border-2 "
                  type="text"
                  maxLength="10"
                  size="10"
                  value={Password}
                  placeholder="Contraseña"
                  onChange={(e) => setPassword(e.target.value)}
                />
              ) : (
                ""
              )}
            </div>
          )
        }
        showModal={modal}
        butonCustom={
          <>
            {text.Error ? (
              ""
            ) : (
              <Button
                text="Entrar"
                onClick={!text.Text.Password ? () => submit() : () => join()}
              />
            )}
            &nbsp;&nbsp;
            <Button text="Salir" onClick={() => exit()} />
          </>
        }
      />
      {modal ? (
        <>
          <h1>Afuera</h1>
        </>
      ) : inGame ? (
        <>
          <Game
            Title={text.Text.Nombre}
            isOwner={owner}
            isZar={text.Text.Zar === userData.Id ? true : false}
            Token={tokenParty}
            Ronda={`[${text.Text.RondaActual}/${text.Text.Rondas}]`}
          />
          {/* <Button onClick={() => exit()} text={"Salir"} /> */}
        </>
      ) : (
        <>
          <h1>{text.Text.Nombre}</h1>
          <div className="grid grid-cols-4 bg-gray-200 p-4 rounded-4 h-screen">
            <div className="overflow-y-scroll">{renderPlayers}</div>
            <div className="col-span-3  rounde-lg">
              <div className="grid grid-cols-4 p-5">
                <div className="col-span-3">
                  {text.Text.Sta === 2 ? game(true) : ""}
                  {owner === userData.Id ? (
                    <>
                      <h1>Información de la partida</h1>
                      <div className="flex mb-2  overflow-hidden">
                        <div className="w-1/2">
                          <p>
                            <b>Rondas:</b> {text.Text.Rondas}
                          </p>
                          <p>
                            <b>Tipo:</b>{" "}
                            {text.Text.Password ? "Privada" : "Publica"}
                          </p>
                          <p>
                            <b> Codigo:</b> {codeParty}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h1>Chat</h1>
                      <p>Espera a que el creador, inicie la partida</p>
                    </>
                  )}
                  <Chat />
                </div>
                <div className="pl-5">
                  {owner === userData.Id && (
                    <details className="mb-2">
                      <summary className="bg-black p-2 text-2xl text-white rounded-xl mb-2">
                        Opciones
                      </summary>
                      <ConfigInParty
                        titulo={text.Text.Nombre}
                        rounds={text.Text.Rondas}
                        players={text.Text.LimitePlayers}
                        TokenRoom={tokenParty}
                      />
                    </details>
                  )}
                  <button
                    className="p-5  m-3 bg-white border-2 border-black rounded-xl text-4xl "
                    onClick={() => Share()}
                  >
                    Compartir
                  </button>
                  <div>
                    <Button
                      text={owner === userData.Id ? "Iniciar" : "Salir"}
                      onClick={
                        owner === userData.Id ? () => StartGame() : () => exit()
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Partida;
