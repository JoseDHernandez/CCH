import React, { useState } from "react";
import { CardXL, Card } from "../components/Card.jsx";
import { Button } from "../components/Button.jsx";
import { newUserRequest } from "../api/users.api.js";
import { Navigate } from "react-router-dom";

const Register = () => {
  const [error, setError] = useState(false);
  const [errorMenssage, setErrorMenssage] = useState({ Black: "", White: "" });
  const [campoActual, setCampoActual] = useState("Nick");
  const [Nick, setNick] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [button, setButton] = useState(true);
  const [buttonB, setButtonB] = useState(false);
  const [warning, setWarning] = useState("");
  //Referencia siguiente campo
  const handleNext = () => {
    setWarning("");
    if (campoActual === "Nick") {
      if (validateText(Nick)) {
        setCampoActual("Email");
      }
      setWarning("Nick");
    } else if (campoActual === "Email") {
      if (validateEmail(Email)) {
        setCampoActual("Password");
      } else {
        setWarning("Email");
      }
    } else if (campoActual === "Password") {
      if (validatePassword(Password)) {
        setCampoActual("Info");
        setButtonB(true);
      }
      setWarning("Password");
    }
  };
  //Referencia al campo anterior
  const handleBack = () => {
    if (campoActual === "Password") {
      setCampoActual("Email");
    } else if (campoActual === "Email") {
      setCampoActual("Nick");
    } else if (campoActual === "Info") {
      setCampoActual("Password");
    }
  };
  /*
  Validaciones Regex
  */
  const validateEmail = (email) => {
    const regex =
      /^([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])$/;
    return regex.test(email);
  };

  const validateText = (Text) => {
    const regex = /^[a-zA-ZÀ-ÿ0-9]{3,15}$/;
    return regex.test(Text);
  };

  const validatePassword = (Password) => {
    const regex = /^[a-zA-ZÀ-ÿ0-9#$@!?¿]{8,10}$/;
    return regex.test(Password);
  };
  //evento onSubmit
  const onSubmit = async (event) => {
    event.preventDefault();
    //Quitar espacios
    const values = {
      Nick: Nick.trim(),
      Email: Email.trim(),
      Password: Password.trim(),
    };
    //Validar campos
    if (
      validateEmail(values.Email) &&
      validatePassword(values.Password) &&
      validateText(Nick.Email)
    ) {
      try {
        const response = await newUserRequest(values);
        if (response === undefined) {
          return alert("Ocurrió un error, intenta iniciar sesión.");
        }
        localStorage.setItem("token", response.data.token);
        window.location.href = "/Game";
      } catch (error) {
        console.log(error);
        switch (error.response.status) {
          case 404:
            setError(true);
            let message = { Black: "", White: "" };
            if (error.response.data.Email && error.response.data.Nick) {
              message.Black = "¿Será un alma gemela o un impostor?";
              message.White =
                "E-mail y Nickname, ya registrados, registra otros.";
            } else if (error.response.data.Email) {
              message.Black = `¡Me escribieron de: ${
                Email.slice(0, 15) + ".."
              }!`;
              message.White =
                "¡Qué coincidencia! Ahora tengo un gemelo de correo electrónico.";
            } else if (error.response.data.Nick) {
              message.Black = `Mi nombre secreto de espía es ________. Shh, no se lo digas a nadie. `;
              message.White = `${Nick}, un nombre de usuario tan común, que ya existe.`;
            }
            setErrorMenssage(message);
            break;
          case 400:
            alert(error.response.data.message);
            break;
        }
      }
    }
  };
  //Resetear formulario
  const formReset = () => {
    setNick("");
    setEmail("");
    setPassword("");
  };
  //Checkbox acceptacion de termino
  const avisoChecked = () => {
    const value = document.getElementById("check").checked;
    if (value) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  const renderCurrentField = () => {
    switch (campoActual) {
      case "Nick":
        return (
          <div>
            <label>Ingresa tu nombre de usuario:</label>
            <input
              className="mt-2 border-2 rounded-2 p-2 text-2xl border-black w-full"
              onChange={(e) => setNick(e.target.value)}
              type="text"
              name="Nick"
              id="Nick"
              value={Nick}
              placeholder="Nombre de usuario"
              maxLength={15}
            />
            <ul className="text-2xl list-disc p-5">
              El nombre de usuario debe cumplir con:
              <li>Contener de 3 a 15 caracteres.</li>
              <li>Contener letras y/o números.</li>
              <li>No incluir caracteres especiales (e.g., @, ?, #, ^, $)</li>
            </ul>
          </div>
        );

      case "Email":
        return (
          <div>
            <label>Ingresa tu correo electrónico:</label>
            <input
              className="mt-2 border-2 rounded-2 p-2 text-2xl border-black w-full"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="Email"
              id="Email"
              value={Email}
              placeholder="e-mail"
              maxLength={150}
            />
            <ul className="text-2xl list-disc p-5">
              Correo electrónico inválido, debe cumplir:
              <li>No debe ser superior a los 150 caracteres.</li>
              <li>Debe tener el formato: nombre@dominio.tipo</li>
            </ul>
          </div>
        );

      case "Password":
        return (
          <div>
            <label>Ingresa tu contrase&ntilde;a:</label>
            <input
              className="mt-2 border-2 rounded-2 p-2 text-2xl border-black w-full"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              name="Password"
              id="Password"
              value={Password}
              placeholder="Constraseña"
              maxLength={10}
            />
            <ul className="text-2xl list-disc p-5">
              Contraseña inválida, debe cumplir:
              <li>Contener de 8 a 10 caracteres.</li>
              <li>Contener letras y/o números.</li>
              <li>Se permiten los siguientes caracteres: # $ @ ! ? ¿ </li>
            </ul>
          </div>
        );

      case "Info":
        return (
          <div className="text-2xl h-96 overflow-y-scroll">
            <p>
              Este juego es una adaptaci&oacute;n web del juego "
              <a href="https://www.cardsagainsthumanity.com/">
                Cards Against Humanity
              </a>
              ". Tanto el juego original como esta adaptaci&oacute;n se
              encuentran bajo la licencia{" "}
              <a href="https://creativecommons.org/licenses/by-nc-sa/2.0/es/">
                CC BY-NC-SA 2.0
              </a>
              . Sin embargo, es importante destacar que esta licencia se aplica
              únicamente a las cartas y al modo de juego. El código fuente de
              esta adaptación no está sujeto a la licencia{" "}
              <a href="https://creativecommons.org/licenses/by-nc-sa/2.0/es/">
                CC BY-NC-SA 2.0
              </a>{" "}
              y se exonera de dicha licencia. Las cartas utilizadas y mostradas
              en este juego son basadas en y copiadas del juego original.
              &#40;disponibles en el apartado de informaci&oacute;n&#41;
            </p>
            <p>
              El desarrollador de esta adaptaci&oacute;n web no se hace
              responsable de las posibles consecuencias que puedan surgir
              durante el desarrollo o la participación en el juego. Es
              importante tener en cuenta que las cartas y los temas abordados en
              el juego pueden contener contenido provocador, ofensivo,
              políticamente incorrecto o explícito.
            </p>
            <p>
              Los jugadores asumen la responsabilidad exclusiva de su
              participación en el juego y se comprometen a jugar bajo su propio
              criterio y discreción. El desarrollador no ser&aacute; responsable
              de ninguna acci&oacute;n, reacci&oacute;n o impacto emocional que
              pueda surgir como resultado de las cartas o interacciones durante
              el juego.
            </p>
            <p>
              Adem&aacute;s, se recomienda encarecidamente a los jugadores tener
              en cuenta los límites y sensibilidades de los dem&aacute;s
              participantes, evitando cualquier comportamiento irrespetuoso,
              discriminatorio o da&ntilde;ino. Al participar en el juego, se
              entiende que los jugadores aceptan impl&iacute;citamente respetar
              estas normas y asumir la responsabilidad de sus propias acciones.
            </p>
            <p>
              Es importante tener en cuenta que el desarrollador del juego no se
              hace responsable de las imágenes &#40; fotos de perfil &#41; ni de
              los textos escritos y/o ingresados por los usuarios &#40; por
              ejemplo: t&iacute;tulos, nombres, contrase&ntilde;as de partidas,
              mensajes en el chat del juego y datos de la cuenta del usurio o
              jugador &#41;. Además, la seguridad de los datos del usuario y las
              cuentas no está bajo la responsabilidad del desarrollador, ya que
              el código fuente del juego se realizo con fines de aprendizaje y
              no se realizo con un gran &eacute;nfasis en la seguridad .
              Cualquier uso o interacción con el juego se realiza bajo la propia
              responsabilidad del jugador.
            </p>
            <p>
              Al registrarte y participar en este juego, confirmas que has
              leído, comprendido y aceptado este aviso de responsabilidad en su
              totalidad.
            </p>
            <label>
              <input
                type="checkbox"
                id="check"
                value={true}
                onClick={() => avisoChecked()}
                onBlur={() => avisoChecked()}
              />
              &nbsp; Confirmo que he leído y asumo la responsabilidad de mi
              participación en este juego.
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center w-auto align-center">
      {error ? (
        <div className="w-screen full h-screen fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50 grid place-items-center">
          <div className="bg-white p-5 rounded-3">
            <h2>Causaste un error, como tu existencia.</h2>
            <div className="grid grid-cols-2 gap-5 mb-3">
              <Card color={true} body={errorMenssage.Black} />
              <Card body={errorMenssage.White} />
            </div>
            <button
              className="bg-gray-800 text-white p-3 rounded-2 hover:bg-black"
              onClick={formReset}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
      {/* Formulario */}
      <form
        className="grid grid-cols-2 gap-x-12 justify-around "
        onSubmit={onSubmit}
      >
        <CardXL
          color={true}
          content={
            <h3 className="text-5xl">
              Cartas
              <br />
              Contra la <br />
              Humanidad
            </h3>
          }
        />
        <div className="overflow-y-hidden bg-white rounded-xl border-5 border-black">
          <h2 className="text-center w-full bg-black text-white p-3 ">
            Registro
          </h2>
          <div className="w-[23em] h-[70%]  p-4 text-3xl transition-transform">
            {renderCurrentField()}
          </div>
          <div className="grid grid-cols-3 p-3">
            {campoActual === "Nick" ? (
              ""
            ) : (
              <>
                {buttonB ? (
                  <Button onClick={() => formReset()} text={"Cancelar"} />
                ) : (
                  <Button onClick={() => handleBack()} text={"Regresar"} />
                )}
              </>
            )}
            <span></span>
            {campoActual === "Info" ? (
              <>
                <Button type="submit" text={`Enviar`} Disable={button} />
              </>
            ) : (
              <>
                <Button onClick={() => handleNext()} text={`Siguiente`} />
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
