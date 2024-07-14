import "../styles/Styles.css";

export const Button = ({
  text = " ",
  Disable,
  onClick,
  type = "button",
  className,
  Style,
}) => {
  const lightStyle = "bg-white text-black hover:bg-gray-400";
  const darkStyle = "bg-black text-white";

  const buttonStyle = `${className || ""} ${
    Disable
      ? "bg-gray-500 text-black cursor-not-allowed"
      : Style
      ? darkStyle
      : lightStyle
  }`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`text-3xl py-2 px-2 rounded-2 animated pulse border-black border-5 ${buttonStyle} cursor-pointer transition-colors delay-150`}
      disabled={Disable}
    >
      {text}
    </button>
  );
};
