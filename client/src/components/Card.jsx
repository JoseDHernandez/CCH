import Logo from "../assets/logo.webp";

const cardColorClass = (isBlack) => {
  return isBlack ? "bg-black text-white" : "text-black bg-white border-black";
};
export const Card = ({
  body,
  color,
  onClick,
  className,
  onDragStart,
  isDraggable,
}) => {
  return (
    <div
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={onDragStart}
      className={`rounded-xl border-2 ${cardColorClass(
        color
      )} box-border sm:w-44 lg:w-48 xl:w-56 2xl:w-64 sm:text-md md:text-lg xl:text-xl 2xl:text-2xl 
        sm:h-56 md:h-60 lg:h-62 xl:h-72 2xl:h-80 sm:p-2 xl:p-3 font-sans font-medium flex-shrink-0 border-black ${
          className || ""
        }`}
    >
      <p className="w-full h-4/5">{body}</p>
      <span className="w-full">
        <img
          src={Logo}
          className="w-11 clear-right float-left"
          alt="Logo"
          width="44px"
        />
        <p className="text-sm float-left ml-2 leading-4 my-1">
          Cartas contra
          <br /> la humanidad
        </p>
      </span>
    </div>
  );
};
/**
 * Componente de tarjeta extra grande (CardXL).
 *
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.content - Contenido principal de la tarjeta.
 * @param {string} props.color - Color de la tarjeta, que se usará para determinar la clase CSS.
 * @param {string} [props.subtitle] - Subtítulo opcional que se mostrará en la tarjeta.
 * @param {string} [props.className] - Clases CSS adicionales opcionales para la tarjeta.
 * @returns {JSX.Element} Un elemento JSX que representa una tarjeta extra grande con el contenido proporcionado.
 */
export const CardXL = ({ content, color, subtitle, className }) => {
  return (
    <div
      style={{ width: "10em", height: "13em" }}
      className={`rounded-xl p-5 border-5 text-5xl font-sans font-medium col-span-1 leading-tight scale-100
       ${cardColorClass(color)} ${className || ""}`}
    >
      <div className="w-full" style={{ height: "90%" }}>
        {content}
      </div>
      <span className="w-full">
        <img
          src={Logo}
          className="w-16 clear-right float-left"
          alt="Logo"
          width="64px"
        />
        <p className="text-lg float-left ml-2 my-1 leading-6">
          Cartas Contra la Humanidad
          <br />
          {subtitle ? subtitle : "CC BY-NC-SA"}
        </p>
      </span>
    </div>
  );
};

export default Card;
