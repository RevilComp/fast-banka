const Button = ({ type, variant, className, onClick, disabled, children }) => {
  let classes = `rounded shadow text-sm px-2.5 py-1.5 ${className} transition-all `;

  switch (variant) {
    case "primary":
      classes += `bg-primary ${
        !disabled && "hover:bg-primary-darker"
      } text-white`;
      break;

    case "secondary":
      classes += `bg-secondary ${
        !disabled && "hover:bg-secondary-darker"
      } text-white`;
      break;

    case "dark":
      classes += `bg-dark ${!disabled && "hover:bg-black"} text-white`;
      break;

    case "success":
      classes += `bg-success ${!disabled && "hover:bg-success"} text-white`;
      break;

    case "danger":
      classes += `bg-danger ${!disabled && "hover:bg-danger"} text-white`;
      break;

    case "black":
      classes += `bg-black ${!disabled && "hover:bg-dark"} text-white`;
      break;

    case "light":
      classes += `bg-light ${!disabled && "hover:bg-white"} text-dark`;
      break;

    case "white":
      classes += `bg-white ${!disabled && "hover:bg-light"} text-black`;
      break;

    case "orange":
      classes += `bg-[#f36944] ${!disabled && "hover:bg-[#f36910]"} text-white`;
      break;

    default:
      classes += `bg-none shadow-none !p-0`;
      break;
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="font-semibold">{children}</span>
    </button>
  );
};

export default Button;
