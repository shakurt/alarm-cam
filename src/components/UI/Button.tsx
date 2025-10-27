import type React from "react";
import { PropagateLoader } from "react-spinners";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  type: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className,
  type,
  disabled,
  loading,
}) => {
  const buttonClasses = twMerge(
    `w-full rounded-lg bg-primary px-3 py-2 text-white text-sm sm:text-base shadow-md transition-all hover:bg-primary/80 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 cursor-pointer focus:ring-primary/50 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed`,
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {children}
      {loading && <PropagateLoader className="ml-2" />}
    </button>
  );
};

export default Button;
