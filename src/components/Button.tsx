import { FC } from "react";

import cx from "classnames";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (value?: any) => void;
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
  primary = false,
  classes,
  type = "button",
}) => {
  const btnBackground = primary
    ? "bg-gradient-to-br from-primary via-primary to-secondary"
    : background
    ? `bg-${background}-500 hover:bg-${background}-700 active:bg-${background}-900`
    : "";

  const baseClasses =
    "block border-transparent font-medium rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50";

  return (
    <button
      type={type}
      className={cx(baseClasses, btnBackground, classes)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
