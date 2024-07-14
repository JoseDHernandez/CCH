import { Button } from "../components/Button.jsx";
import { useState } from "react";
import { Modal } from "../components/Modal.jsx";
import { CardXL } from "../components/Card.jsx";
import { loginUserRequest } from "../api/users.api.js";
import { useUser } from "../context/User.context.jsx";
const Login = () => {
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [button, setButton] = useState(false);
  const [modal, setModal] = useState({ hidden: false, msn: null });
  const validatePassword = (Password) => {
    const regex = new RegExp(/^[a-zA-ZÀ-ÿ0-9#$@!?¿]{3,10}$/);
    return regex.test(Password);
  };
  const validateEmail = (email) => {
    const regex = new RegExp(
      /^([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])$/
    );
    return regex.test(email);
  };
  function modalClose() {
    window.location.reload();
  }
  async function onSubmit() {
    setButton(true);
    if (!validatePassword(password) && !validateEmail(email))
      return setModal({ hidden: true, msn: "Datos invalidos." });
    if (!validatePassword(password))
      return setModal({ hidden: true, msn: "Contraseña invalida." });
    if (!validateEmail(email))
      return setModal({ hidden: true, msn: "Correo electrónico invalido." });
    try {
      const response = await loginUserRequest({
        Email: email,
        Password: password,
      });
      if (response.status === 201)
        return login(response.data.token, response.data.User[0]);
    } catch (error) {
      console.log(error);
      if (error.response.status === 400)
        return setModal({
          hidden: true,
          msn: `Error al iniciar sesión: ${error.response.data.message}`,
        });
    }
  }
  return (
    <>
      <Modal
        showModal={modal.hidden}
        modalContent={<p className="text-3xl">{modal.msn}</p>}
        butonCustom={<Button text="Cerrar" onClick={() => modalClose()} />}
      />
      <div className="flex  justify-center w-auto align-center">
        <span className=" flex justify-between w-3/5 p-5">
          <CardXL
            color={true}
            content={
              <p>
                Cartas
                <br />
                Contra la <br />
                Humanidad
              </p>
            }
          />
          <form className=" flex flex-col  text-3xl gap-y-6">
            <h1 className="text-6xl">Inicio de sesi&oacute;n</h1>
            <label>
              <p>Correo electrónico</p>
              <input
                className="p-1 rounded-2 text-black border-black border-2"
                type="text"
                values={email}
                placeholder="email@hosting.com"
                maxLength="150"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              <p>Contraseña</p>
              <input
                className="p-1 rounded-2 text-black border-black border-2"
                type="password"
                values={password}
                placeholder="*********"
                maxLength="10"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <div className="float-right w-auto">
              <Button
                text="Ingresar"
                type="submit"
                Disable={button}
                onClick={() => onSubmit()}
              />
            </div>
          </form>
        </span>
      </div>
    </>
  );
};

export default Login;
