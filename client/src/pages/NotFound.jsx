import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { NumberRandom } from "../components/NumbersRandom";
const NotFound = () => {
  const [blackTitle, setBlackTitle] = useState([]);
  const [whiteTitles, setWhiteTitles] = useState([""]);
  const blackCards = [
    '¡Nada dice "te amo" como ___!',
    "¿Qué me trae siempre una sonrisa en el rostro?",
    "¿Qué es lo que arruina cualquier cena familiar?",
    "El próximo producto de Apple se llama ___.",
    "En el futuro, los museos mostrarán ___ como arte.",
    "Lo único que necesito para ser feliz es ___.",
    "___: el ingrediente secreto de mi receta especial.",
    "¿Cuál es la mejor manera de comenzar el día?",
    "___: el secreto para una fiesta inolvidable.",
    "¿Qué es lo que realmente pasa en el Área 51?",
  ];
  const whiteCards = [
    "Un plátano que hace trucos de magia",
    "Arrancar los pantalones con los dientes.",
    "Una colección de caracoles vivos.",
    "El sabor de la justicia.",
    "Un abrazo inapropiado de tu tía.",
    "Hacer pucheros.",
    "Un paseo en el parque con Bill Cosby.",
    "Un perro volador.",
    "Hacer trampa en los Juegos Olímpicos Especiales.",
    "Una patada voladora a lo Chuck Norris.",
    "Una piñata llena de escorpiones.",
    "La purga anual.",
    "Jugar a ser Dios.",
    "Una colonia de piojos inteligentes.",
    "Un abuelito con parkinson jugando a los bolos.",
    "Robarle el unicornio a un niño.",
    "Un beso negro sorpresa.",
    "Romper la piñata solo para encontrar un espejo.",
    "Un osito de peluche con sangre en los ojos.",
    "Hacer cosplay de Hitler.",
    "Una caja de gatos que no saben usar el arenero.",
    "Un conejo con gafas de sol.",
    "Pecera con peces cantantes.",
    "Reflexionar.",
  ];
  useEffect(() => {
    const Number = NumberRandom(0, 9, 1);
    setBlackTitle(blackCards[Number[0]]);
    const Numbers = NumberRandom(0, 22, 4);
    setWhiteTitles(() => Numbers.map((Number) => whiteCards[Number]));
  }, []);
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-5xl font-semibold text-black">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Pagina no encontrada 😔
        </h1>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/"
            className=" no-underline rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            Ir al inicio
          </a>
          <a
            href="/login"
            className=" no-underline rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold border-black border-2 box-content text-black shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            Ingresar
          </a>
        </div>

        <div className="bg-gray-100 p-5 mt-5 rounded-2">
          <p className="mt-3 mb-6 text-2xl  text-black">
            {blackTitle
              ? blackTitle
              : "¿Cuál es la verdadera causa del cambio climático?"}
          </p>
          <div className="grid grid-cols-4 gap-5 max-w-5xl">
            {whiteTitles.map((text, index) => (
              <div
                key={index}
                className="rounded-md border-black p-2 border-2 "
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
