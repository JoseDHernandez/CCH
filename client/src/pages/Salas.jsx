import { useState, useEffect } from "react";
import { useUser } from "../context/User.context";
import { Modal } from "../components/Modal";
import { Loader } from "../components/Loader";
import { Button } from "../components/Button";
import { joinParty } from "../api/game.api";
import { socket } from "../api/config";
import "../styles/Styles.css";
import {
  validateTitle,
  validateNumber,
  validatePassword,
  validateCode,
} from "../components/Regex";
const Salas = () => {
  const { userData, party, codeParty } = useUser();
  const [error, setError] = useState(false);
  const [errorMenssage, setErrorMenssage] = useState("");
  const [lista, setLista] = useState([]);
  //datos del formulario
  const [name, setName] = useState("");
  const [round, setRound] = useState("");
  const [roundInput, setRoundInput] = useState("");
  const [playersInput, setPlayersInput] = useState("");
  const [players, setPlayers] = useState("");
  const [password, setPassword] = useState("");
  const [tipo, setTipo] = useState("false");
  //Codigo
  const [codeRoom, setCode] = useState("");
  //Boton de datos del formulario
  const [submit, setSubmit] = useState(false);

  //Algoritmo de validar los datos y crear la sala
  const createParty = () => {
    setSubmit(true);
    event.preventDefault();
    let datos = {
      Nombre: "",
      Rondas: "",
      Players: "",
      Tipo: false,
      Password: "",
      Id: "",
      SockId: socket.id,
    };
    let datosV = {
      Nombre: false,
      Rondas: false,
      Players: false,
      Tipo: false,
      Password: false,
    };
    //validar numero de rondas
    if (round === "1") {
      if (validateNumber(roundInput)) {
        datosV.Rondas = true;
        datos.Rondas = roundInput;
      } else {
        datosV.Rondas = false;
        datos.Rondas = "";
        setErrorMenssage("Numero de rondas invalidas 1");
        return setError(true);
      }
    } else if (validateNumber(round)) {
      datosV.Rondas = true;
      datos.Rondas = round;
    } else {
      if (round.length === 0) {
        datosV.Rondas = true;
        datos.Rondas = 4;
      } else {
        datos.Rondas = "";
        setErrorMenssage("Numero de rondas invalidas 2");
        datosV.Rondas = false;
        return setError(true);
      }
    }
    //validar numero de jugadores
    if (players.length === 0) {
      setPlayers("4");
    }
    if (players === "1") {
      if (validateNumber(playersInput)) {
        datos.Players = playersInput;
        datosV.Players = true;
      } else {
        setErrorMenssage("Numero de jugadores invalido");
        datosV.Players = false;
        datos.Players = "";
        return setError(true);
      }
    } else if (validateNumber(players)) {
      datos.Players = players;
      datosV.Players = true;
    } else {
      setErrorMenssage("Numero de jugadores invalido");
      datos.Players = "";
      datosV.Players = false;
      return setError(true);
    }
    //Validar clave
    if (tipo === "true") {
      if (validatePassword(password)) {
        datos.Password = password.trim();
      } else {
        setErrorMenssage("Clave invalida");
        return setError(true);
      }
    } else {
      datos.Password = "";
    }
    //validar el titulo de la sala y verficiar los numeros de rondas y jugadores
    if (validateTitle(name) && datosV.Rondas && datosV.Players) {
      datos.Nombre = name.trim();
      datos.Id = userData.Id;
      console.log(datos);
      socket.emit("client:createParty", datos);
      //Recibir codigo de la sala y redireccionar a la sala
      socket.on("server:partyCreated", (data) => {
        party(data.Code, data.Token);
        window.location.href = "/Game/party";
      });
    } else {
      setErrorMenssage("Datos invalidos");
      return setError(true);
    }
  };
  //Unise directo por codigo
  function code() {
    if (!validateCode(codeRoom)) {
      setErrorMenssage("Codigo invalido");
      return setError(true);
    }
    navigateParty(codeRoom);
  }
  //Obtener lista de partidas
  useEffect(() => {
    socket.on("server:listPartys", (data) => {
      setLista(data);
    });
    return () => {
      socket.off("server:listPartys");
    };
  }, []);
  //Redireccion a la partida
  async function navigateParty(code) {
    try {
      const response = await joinParty(code);
      if (response.status === 200) {
        party(response.data.Code, response.data.Token);
        window.location.href = "/Game/party";
      }
    } catch (error) {
      if (error.response.status === 401) {
        setErrorMenssage(
          "Tienes fecha de vencimiento, vuelve a iniciar sesión."
        );
        return setError(true);
      }
      console.error(error);
    }
  }
  //Cargar/mostrar el lista de partidas
  function renderList() {
    if (lista.length === 0) {
      return (
        <>
          <h2>No hay partidas disponibles, crea una.</h2>
        </>
      );
    } else if (lista.status === 204)
      return (
        <>
          <h2>No cargaron las partidas, porfavor recarga la pagina.</h2>
          <div>
            <Button text={"Recargar"} onClick={formReset} />
          </div>
        </>
      );
    const Tiempo = Date.now();
    return lista.map((dato, index) => (
      <div
        key={dato.Id}
        className={`h-60  grid grid-cols-5 grid-rows-3  my-2 p-3 rounded-3 border-black border-2 bg-white ${
          index == lista.length - 1 && "animated fadeInUp"
        }`}
      >
        <img
          src={dato.Photo}
          className=" col-span-1 row-span-3 w-60 h-full object-cover rounded-4 border-black border-2"
        />
        <h4 className="col-span-4 pt-2 pl-5 text-4xl">{dato.Nombre}</h4>
        <p className="col-span-4 pl-5 text-3xl">{dato.Nick}</p>
        <p className="pl-5 text-xl">
          <i className="fa-solid fa-user"></i>{" "}
          {dato.Players === dato.LimitePlayers
            ? "Lleno"
            : `${dato.Players} de ${dato.LimitePlayers}`}
        </p>
        <p className="text-xl">
          <strong>Rondas: </strong>
          {dato.RondaActual === dato.Rondas
            ? "Finalizando"
            : `${dato.RondaActual === null ? "0" : dato.RondaActual} / ${
                dato.Rondas
              }`}
        </p>
        <p className="text-xl">
          <strong>{dato.Estado == "Privada" ? "Privada" : dato.Estado}</strong>
        </p>
        <Button onClick={() => navigateParty(dato.Codigo)} text="Unirse" />
      </div>
    ));
  }

  //Resetea el formulario en caso de un error
  const formReset = () => {
    location.reload();
  };
  return (
    <>
      {submit ? <Loader loaderShow={true} /> : ""}
      <h1>Partidas</h1>
      {error ? (
        <Modal
          modalContent={<p className="text-2xl">{errorMenssage}</p>}
          showModal={true}
          butonCustom={<Button text={"Cerrar"} onClick={() => formReset()} />}
        />
      ) : (
        ""
      )}
      <br />
      <div className="grid grid-cols-3 gap-5 bg-gray-200 p-5 rounded-4">
        <span>
          <details open className="basis-1/3 ">
            <summary className="mb-4 text-3xl">Crear partida</summary>
            <form
              className="p-4 rounded-4 border-black border-2 text-2xl bg-gray-300 "
              method="post"
            >
              <div className="grid grid-cols-2 gap-y-5">
                <label className="w-full">Nombre de la partida</label>
                <input
                  className="w-full p-1 rounded-2 border-black border-2 col-span-2"
                  type="text"
                  maxLength="50"
                  id=""
                  name=""
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sala de reunion secreta"
                />
                <label
                  htmlFor={round === "1" ? "numeroRondasInput" : "numeroRondas"}
                >
                  Rondas
                </label>
                <select
                  name="numeroRondas"
                  id="numeroRondas"
                  onChange={(e) => setRound(e.target.value)}
                  className={`p-1 rounded-2 border-black border-2 ${
                    round === "1" ? "hidden" : "block"
                  }`}
                >
                  <option value="4" defaultValue={true}>
                    4 rondas
                  </option>
                  <option value="6">6 rondas</option>
                  <option value="10">10 rondas</option>
                  <option value="15">15 rondas</option>
                  <option value="20">20 rondas</option>
                  <option value="30">30 rondas</option>
                  <option value="1">Personalizada</option>
                </select>
                {round === "1" ? (
                  <input
                    className="p-1 rounded-2 border-black border-2"
                    type="text"
                    id="numeroRondasInput"
                    name=""
                    maxLength="2"
                    value={roundInput}
                    onChange={(e) => setRoundInput(e.target.value)}
                    placeholder="Max. 50 rondas"
                  />
                ) : (
                  ""
                )}
                <label
                  htmlFor={
                    players === "1" ? "numeroJugadoresInput" : "numeroJugadores"
                  }
                >
                  Jugadores
                </label>{" "}
                <select
                  name="numeroJugadores"
                  id="numeroJugadores"
                  onChange={(e) => setPlayers(e.target.value)}
                  className={`p-1 rounded-2 border-black border-2 ${
                    players === "1" ? "hidden" : "block"
                  }`}
                >
                  <option value="4" defaultValue={true}>
                    4 jugadores
                  </option>
                  <option value="6">6 jugadores</option>
                  <option value="8">8 jugadores</option>
                  <option value="1">Personalizada</option>
                </select>
                {players === "1" ? (
                  <input
                    className="p-1 rounded-2 border-black border-2"
                    type="text"
                    id="numeroJugadoresInput"
                    name=""
                    maxLength="2"
                    value={playersInput}
                    onChange={(e) => setPlayersInput(e.target.value)}
                    placeholder="Max. 15 jugadores"
                  />
                ) : (
                  ""
                )}
                <label>Tipo de partida</label>
                <select
                  name="Tipo"
                  onChange={(e) => setTipo(e.target.value)}
                  className="p-1 rounded-2 border-black border-2"
                >
                  <option value={false}>Publica</option>
                  <option value={true}>Privada</option>
                </select>
                {tipo === "true" ? (
                  <>
                    <label>Contraseña</label>
                    <input
                      className="p-1 rounded-2 border-black border-2"
                      type="text"
                      id=""
                      name=""
                      value={password}
                      maxLength="10"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=" 8-10 caracteres"
                    />
                  </>
                ) : (
                  ""
                )}
                <br />
                <Button
                  onClick={createParty}
                  text={submit ? "Creando" : "Crear"}
                  Disable={submit}
                />
              </div>
            </form>
          </details>
          <div className="bg-white p-5 text-2xl mt-3 border-black border-2 rounded-4">
            <label className="mb-3">
              Codigo
              <input
                className="p-1 rounded-2 border-black border-2 ml-5"
                type="text"
                value={codeRoom}
                maxLength="15"
                size="15"
                onChange={(e) => setCode(e.target.value)}
                placeholder="Xt4asd7DeZA"
              />
            </label>
            <br />
            <Button text="Ingresar" onClick={() => code()} />
          </div>
        </span>
        <div className="col-span-2">{renderList()}</div>
      </div>
    </>
  );
};

export default Salas;
