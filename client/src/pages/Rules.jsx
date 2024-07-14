import React from "react";
import { Card, CardXL } from "../components/Card";
const Rules = () => {
  return (
    <>
      <div className="grid grid-cols-3">
        <CardXL className={"col-span-1"} color={true}>
          <p>Información</p>
        </CardXL>
        <main className="col-span-2">
          <section className="bg-gray-200 p-4 rounded-xl ">
            <div className="grid grid-cols-4">
              <Card body={"Desarrollo del Juego"} />
              <Card
                body={
                  "Se elige a un jugador de manera aleatoria para que sea el zar."
                }
              />
              <Card
                body={
                  "Los otros jugadores deberan seleccionar una o dos cartas para completar la oración."
                }
              />
              <Card
                body={
                  "El zar selecciona la carta  más divertida para completar la oración."
                }
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Rules;
