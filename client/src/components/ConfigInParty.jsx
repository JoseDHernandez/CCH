import { useState } from "react";
import { updateData } from "../api/game.api";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { socket } from "../api/config";
import { validateTitle } from "../components/Regex";
export const ConfigInParty = ({ titulo, rounds, players, TokenRoom }) => {
  const [round, setRound] = useState(rounds);
  const [maxPlayers, setMaxPlayers] = useState(players);
  const [nombre, setNombre] = useState(titulo);
  const [buttonUpdate, setButtonUpdate] = useState(false);
  const [modal, setModal] = useState(false);
  async function updateConfig(actualRounds, actualPlayers, actualName) {
    setButtonUpdate(true);
    let options = {
      Rounds: false,
      Players: false,
      Nombre: false,
    };
    if (round >= 4 && round <= 50) {
      options.Rounds = round;
    } else {
      options.Rounds = false;
    }
    if (maxPlayers > actualPlayers && maxPlayers <= 50) {
      options.Players = maxPlayers;
    } else {
      options.Players = false;
    }
    if (validateTitle(nombre)) {
      options.Nombre = nombre.trim();
    } else {
      options.Nombre = actualName;
    }
    if (options.Players === false) {
      options.Players = players;
    }
    if (options.Rounds === false) {
      options.Rounds = rounds;
    }
    if (
      options.Rounds != false &&
      options.Players != false &&
      options.Nombre != false
    ) {
      try {
        const response = await updateData({
          token: TokenRoom,
          newRounds: options.Rounds,
          newPlayers: options.Players,
          newName: options.Nombre,
        });
        if (response.status === 201) {
          socket.emit("client:reloadPage", TokenRoom);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setModal(true);
    }
    setButtonUpdate(false);
  }

  return (
    <>
      {" "}
      <Modal
        modalContent={
          <>
            <p>
              Datos invalidos, ingresa números mayores a los actuales o menores
              a 50.
            </p>
            <table className=" border border-black">
              <thead className="bg-gray-400">
                <tr>
                  <th>Valores</th>
                  <th>Rondas</th>
                  <th>Jugadores</th>
                </tr>
              </thead>
              <tbody className="text-center">
                <tr>
                  <th className="bg-gray-300 text-left">Actual</th>
                  <td>{rounds}</td>
                  <td>{players}</td>
                </tr>
                <tr>
                  <th className="bg-gray-300 text-left">Ingresado</th>
                  <td>{round}</td>
                  <td>{maxPlayers}</td>
                </tr>
              </tbody>
            </table>
          </>
        }
        showModal={modal}
      />
      <div className="grid grid-cols-2 w-full gap-2 border-2 border-gray-800 rounded-lg bg-white p-2 ">
        <label htmlFor="nombre">Nombre:</label>
        <input
          type="text"
          maxLength="50"
          className=" p-1 rounded-2 border-black border-2 col-span-2 "
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <label htmlFor="rondas">
          <strong>Rondas: </strong>
        </label>
        <input
          placeholder={rounds}
          type="number"
          size="10"
          min={rounds}
          max="50"
          maxLength="2"
          id="rondas"
          value={round}
          onChange={(e) => setRound(e.target.value)}
          className=" p-1 rounded-2 border-black border-2 "
        />
        <label htmlFor="players">
          <strong>Jugadores: </strong>
        </label>
        <input
          placeholder={players}
          type="number"
          size="10"
          maxLength="2"
          id="players"
          min={players}
          max="50"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(e.target.value)}
          className=" p-1 rounded-2 border-black border-2 "
        />
        <div>
          <Button
            text={"Actualizar"}
            Disable={buttonUpdate}
            onClick={() => updateConfig(rounds, players)}
          />
        </div>
      </div>
    </>
  );
};

export default ConfigInParty;
