import type React from "react";

import { twMerge } from "tailwind-merge";

type CheckboxProps = {
  label?: string;
  className?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  name: string;
};

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className,
  checked,
  onChange,
  name,
}) => {
  const checkboxClass = twMerge(
    "h-4 w-4 cursor-pointer rounded border-card bg-bg text-primary transition-all focus:outline-none",
    className
  );

  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        name={name}
        id={name}
        className={checkboxClass}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label && (
        <span className="text-white transition-colors select-none">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
