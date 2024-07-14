import { useEffect, useState } from "react";
import "../styles/Styles.css";
import { CardXL, Card } from "../components/Card";

export const Loader = ({ loaderShow }) => {
  const [loaderView, setLoaderView] = useState(loaderShow);

  useEffect(() => {
    setLoaderView(loaderShow);
  }, [loaderShow]);

  const handleTransitionEnd = () => {
    if (!loaderShow) {
      setLoaderView(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        loaderView ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="bg-white bg absolute inset-0"></div>
      <div className="relative grid grid-cols-2">
        <CardXL
          className={"drop-shadow-xl animated fadeInLeft"}
          children={
            <h1 className="text-6xl">
              Cartas <br />
              Contra la <br />
              Humanidad
            </h1>
          }
          color={true}
        />
        <div className="grid grid-rows-2">
          <p className="text-5xl my-auto">¿Cuál será tu próxima carta?</p>
          <h1 className="texto-latiendo text-8xl mx-auto">Cargando.</h1>
        </div>
      </div>
    </div>
  );
};

export default Loader;
