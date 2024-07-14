import React, { useState } from "react";
import { useUser } from "../context/User.context";
import "../styles/Styles.css";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { CardXL, Card } from "../components/Card";
import { useEffect } from "react";
import { logrosUserRequest } from "../api/users.api";
const User = () => {
  const { userData, logout } = useUser();
  const [error, setError] = useState(false);
  const [submitButton, setSubmitButton] = useState(true);
  const [email, setEmail] = useState("");
  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState("");
  const [logros, setLogros] = useState([]);
  const [logroView, setLogroView] = useState([]);
  const [ViewLogro, setViewLogro] = useState(false);
  async function loadLogros() {
    try {
      const response = await logrosUserRequest(userData.Id);
      if (response.data.lenght === 0) {
        console.log("no hay logros");
      }
      setLogros(response.data);
    } catch (error) {
      if (error.response.status === 401) return setError(true);
      console.log(error);
    }
  }
  useEffect(() => {
    loadLogros();
  }, []);
  function view(id) {
    setLogroView(logros[id]);
    setViewLogro(true);
  }
  function viewOff() {
    setLogroView("");
    setViewLogro(false);
  }
  function renderLogros() {
    return logros.map((logro) => (
      <Card
        key={logro.Id}
        onClick={logro.Descripcion === null ? null : () => view(logro.Id - 1)}
        body={logro.Texto}
        color={logro.Descripcion === null ? false : true}
      />
    ));
  }
  return (
    <>
      {error && (
        <Modal
          showModal={error}
          modalContent={
            <p className="text-2xl">Token expirado, vuelve a iniciar sesión.</p>
          }
          butonCustom={
            <Button text={"Cerrar sesión"} onClick={() => logout()} />
          }
        />
      )}
      {ViewLogro ? (
        <div className="fixed inset-0 z-50 ">
          <div className="bg-white absolute inset-0 w-full h-full p-5 ">
            <h1 className="mb-5">
              <i
                className="fa-solid fa-arrow-left animated zoomIn"
                onClick={() => viewOff()}
              ></i>{" "}
              Información del logro #{logroView.Id}
            </h1>
            <div className="flex">
              <CardXL
                className="animated fadeInLeft"
                children={<p>{logroView.Texto}</p>}
                color={logroView.Descripcion === null ? false : true}
              />
              <p className="p-10 text-5xl animated fadeInUp">
                {logroView.Descripcion}
              </p>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      <h1>Información del usuario</h1>
      <div className="flex">
        <div className=" bg-gray-200 p-4 rounded-3 mr-5">
          <div className="grid grid-cols-3 grid-rows-2 h-52 mb-4">
            <img
              className=" bg-black w-xl rounded-4 w-80 h-full border-black border-2 row-span-2 col-span-1"
              src={
                userData.Photo == 1
                  ? `../../public/avatar_images/1.png`
                  : userData.Photo
              }
              alt="Imagen user"
            />
            <h1 className="col-span-2 text-5xl pl-5">{userData.Nick}</h1>
            <p className="col-span-2 text-4xl pl-5">
              Puntos:{" "}
              {userData.Points === 0 ? (
                "Sin puntos"
              ) : (
                <strong>{userData.Points}</strong>
              )}
            </p>
          </div>
          <details open>
            <summary className="text-2xl">Datos</summary>
            <form className=" text-2xl" method="post">
              <div className="grid grid-cols-2 bg-white p-4 gap-y-5">
                <label>Contraseña</label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-1 rounded-2 border-black border-2"
                  type="password"
                  maxlenght="10"
                  size="10"
                  value={password}
                  name="Password"
                  id="Password"
                  placeholder="*********"
                />
                <label>Nombre de usuario</label>
                <input
                  onChange={(e) => setNick(e.target.value)}
                  className="p-1 rounded-2 border-black border-2"
                  type="text"
                  maxlenght="10"
                  size="10"
                  value={nick}
                  name="Nick"
                  id="Nick"
                  placeholder={userData.Nick}
                />
                <label className="col-span-2">Correo electrónico</label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-1 rounded-2 border-black border-2 col-span-2"
                  type="email"
                  maxlenght="150"
                  size="50"
                  name="Email"
                  value={email}
                  id="Email"
                  placeholder={userData.Email}
                />
                <label className="col-span-2">
                  Foto de perfil &#40; Ingresar URL &#41;
                </label>
                <input
                  onChange={(e) => setPhoto(e.target.value)}
                  className="p-1 rounded-2 border-black border-2 col-span-2"
                  type="url"
                  value={photo}
                  maxlenght="256"
                  name="Photo"
                  id="Photo"
                  placeholder="https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif"
                />
                <br />
                <div className="float-right">
                  <Button
                    Disable={submitButton}
                    text={submitButton ? "Actualizar" : "Actualizando"}
                    type="submit"
                  />
                </div>
              </div>
            </form>
          </details>
        </div>
        <div className="w-3/5  p-4 rounded-3 bg-gray-200">
          <h2 className="">Logros</h2>
          <div className="grid grid-cols-3 grid-flow-row gap-4 w-full">
            {renderLogros()}
          </div>
        </div>
      </div>
    </>
  );
};

export default User;
