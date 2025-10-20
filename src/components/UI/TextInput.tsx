import type React from "react";

import { twMerge } from "tailwind-merge";

type TextInputProps = {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange: (value: string) => void;
  type: "text" | "email" | "password";
  name: string;
};

const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  className,
  value,
  onChange,
  type,
  name,
}) => {
  const textInputClass = twMerge(
    "w-full rounded-lg border border-secondary border-2 bg-bg px-4 py-2.5 text-white placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all",
    className
  );

  return (
    <input
      name={name}
      id={name}
      type={type}
      className={textInputClass}
      autoComplete={type === "email" ? "email" : "off"}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default TextInput;
