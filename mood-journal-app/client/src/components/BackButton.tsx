import React from "react";

interface BackButtonProps {
  onClick?: () => void;
  to?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "stone" | "gray";
}

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  to,
  className = "",
  children = "뒤로 가기",
  variant = "default",
}) => {
  const baseClasses = "px-4 py-2 rounded-lg transition-colors";

  const variantClasses = {
    default:
      "bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700",
    stone:
      "bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700",
    gray: "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500",
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (onClick) {
    return (
      <button onClick={onClick} className={buttonClasses}>
        {children}
      </button>
    );
  }

  if (to) {
    return (
      <a href={to} className={buttonClasses}>
        {children}
      </a>
    );
  }

  return <button className={buttonClasses}>{children}</button>;
};

export default BackButton;
