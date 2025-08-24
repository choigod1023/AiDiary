import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  text,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const colorClasses = {
    primary: "text-amber-600 dark:text-amber-400",
    secondary: "text-stone-600 dark:text-stone-400",
    white: "text-white",
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div
        className={`rounded-full border-2 border-current animate-spin border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && (
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
