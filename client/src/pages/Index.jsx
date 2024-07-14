import { useState } from "react";
import { useEffect } from "react";
import { NumberRandom } from "../components/NumbersRandom";
import { Button } from "../components/Button";
import { Card, CardXL } from "../components/Card";
import { Link } from "react-router-dom";
const Index = () => {
  const [index, setIndex] = useState(["z-30", "z-20", "z-10"]);
  useEffect(() => {
    const interval = setInterval(() => {
      // Cambia en los z index de index
      setIndex((prevIndex) => {
        const temp = prevIndex[0];
        prevIndex.shift();
        prevIndex.push(temp);
        return [...prevIndex];
      });
    }, 10000);

    return () => {
      // Limpia el intervalo cuando el componente se desmonta
      clearInterval(interval);
    };
  }, []);
  return (
    <>
      <main>
        <section className="flex justify-center p-5">
          <div className="w-1/2 ">
            <CardXL
              color={true}
              className={`absolute ${index[0]}`}
              content={
                <h3 className="text-5xl">
                  Cartas
                  <br />
                  Contra de la <br />
                  Humanidad
                </h3>
              }
            />
            <CardXL
              className={`absolute ${index[1]} left-44`}
              content={<h3 className="text-6xl">Crea partidas unicas</h3>}
            />
            <CardXL
              className={`absolute ${index[2]} left-80`}
              content={<h3 className="text-6xl">Juega con tus amigos</h3>}
            />
          </div>
          <div className="w-1/2  text-center">
            <h1 className="text-8xl">Cartas Contra la Humanidad</h1>
            <br></br>
            <p className="mt-5 text-4xl">
              El &uacute;nico juego en el que puedes ganar siendo el peor ser
              humano posible. ¡Bienvenido a Cartas contra la humanidad, donde el
              humnor negro es el rey y tus amigos te juzgan en cada carta!
            </p>
            <div className="p-5">
              <Link to={"/login"}>
                <Button text={"Ingresar"} Style className={"float-left"} />
              </Link>
              <Link to={"/register"}>
                <Button text={"Registrarse"} className={"float-right"} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
