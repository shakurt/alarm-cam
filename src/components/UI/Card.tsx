import { twMerge } from "tailwind-merge";

type CardProps = {
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ className, ariaLabel, children }) => {
  const cardClass = twMerge(
    "bg-card  shadow-md rounded-md px-3 py-2",
    className
  );

  return (
    <div className={cardClass} aria-label={ariaLabel}>
      {children}
    </div>
  );
};

Card.displayName = "Card";

export default Card;
