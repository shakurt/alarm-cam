import type React from "react";

import { twMerge } from "tailwind-merge";

type ButtonProps = {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  type: "button" | "submit" | "reset";
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className,
  type,
  disabled,
}) => {
  const buttonClasses = twMerge(
    `w-full rounded-lg bg-primary px-6 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 cursor-pointer focus:ring-primary/50 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed`,
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
