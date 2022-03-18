import { FC } from "react";

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  background?: string;
  primary?: boolean;
  classes?: string;
  type?: "button" | "submit";
}

const Button: FC<ButtonProps> = ({
  children,
  background,
  onClick = () => null,
  disabled = false,
  classes,
  type = "button",
}) => {
  const baseClasses =
    "block border-transparent rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue disabled:opacity-50";

  return (
    <button
      type={type}
      className={`${baseClasses} bg-${background} ${classes}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
