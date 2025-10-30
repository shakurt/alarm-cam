import { twMerge } from "tailwind-merge";

type ChipProps = {
  className?: string;
  children: React.ReactNode;
};

const Chip: React.FC<ChipProps> = ({ children, className }) => {
  const checkboxClass = twMerge(
    `rounded-full px-2 py-[2px] text-sm text-white flex items-center font-semibold justify-center inline-block bg-gray-500`,
    className
  );

  return <span className={checkboxClass}>{children}</span>;
};

export default Chip;
