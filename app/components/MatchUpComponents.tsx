"use client";

import { type ReactNode, forwardRef } from "react";

// Base Button Component - Highly reusable
type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  icon,
  fullWidth = false,
  loading = false,
  ...props
}, ref) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary:
      "bg-yellow-400 hover:bg-yellow-500 text-white",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-900",
    outline:
      "border border-yellow-400 hover:bg-yellow-50 text-yellow-400",
    ghost:
      "hover:bg-gray-100 text-gray-600",
  };

  const sizeClasses = {
    sm: "text-xs px-3 py-2 rounded-lg",
    md: "text-sm px-4 py-2.5 rounded-lg",
    lg: "text-base px-6 py-3 rounded-lg",
  };

  const widthClasses = fullWidth ? "w-full" : "";

  return (
    <button
      ref={ref}
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span className="flex items-center mr-2">{icon}</span>}
      {children}
    </button>
  );
});

Button.displayName = "Button";

// Category Button Component - Reusable for any category selection
type CategoryButtonProps = {
  children: ReactNode;
  icon: ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const CategoryButton = forwardRef<HTMLButtonElement, CategoryButtonProps>(({
  children,
  icon,
  isActive = false,
  onClick,
  disabled = false,
  className = "",
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? "bg-yellow-400 text-white" 
          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-medium">{children}</span>
    </button>
  );
});

CategoryButton.displayName = "CategoryButton";

// Event Card Component - Reusable for any event display
type EventCardProps = {
  title: string;
  category: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  status?: "active" | "ended" | "upcoming";
  participants?: number;
  endDate?: string;
}

export const EventCard = forwardRef<HTMLDivElement, EventCardProps>(({
  title,
  category,
  description,
  onClick,
  className = "",
  variant = "default",
  status = "active",
  participants,
  endDate,
  ...props
}, ref) => {
  const statusColors = {
    active: "bg-green-500",
    ended: "bg-gray-500",
    upcoming: "bg-blue-500"
  };

  const cardVariants = {
    default: "p-4",
    compact: "p-3",
    detailed: "p-6"
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${cardVariants[variant]} ${className}`}
      {...props}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
        <div className="flex items-center space-x-2">
          <span className={`${statusColors[status]} text-white text-xs px-2 py-1 rounded-full`}>
            {category}
          </span>
          {status && (
            <span className="text-xs text-gray-500 capitalize">{status}</span>
          )}
        </div>
      </div>
      
      {description && (
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span className="mr-2">🕐</span>
          <span>{description}</span>
        </div>
      )}

      {(participants || endDate) && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          {participants && (
            <span>{participants.toLocaleString()} participants</span>
          )}
          {endDate && (
            <span>Ends {endDate}</span>
          )}
        </div>
      )}
    </div>
  );
});

EventCard.displayName = "EventCard";

// Navigation Item Component - Reusable for any navigation
type NavigationItemProps = {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  badge?: ReactNode;
}

export const NavigationItem = forwardRef<HTMLButtonElement, NavigationItemProps>(({
  icon,
  label,
  isActive = false,
  onClick,
  disabled = false,
  className = "",
  badge,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors relative ${
        isActive 
          ? "bg-yellow-100 text-gray-900" 
          : "text-gray-600 hover:text-gray-900"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
});

NavigationItem.displayName = "NavigationItem";

// Card Component - Generic reusable card
type CardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "elevated" | "outlined";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className = "",
  onClick,
  variant = "default",
  ...props
}, ref) => {
  const variantClasses = {
    default: "bg-white border border-gray-200",
    elevated: "bg-white shadow-lg border-0",
    outlined: "bg-transparent border-2 border-gray-300"
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`rounded-lg p-4 transition-all ${variantClasses[variant]} ${onClick ? "cursor-pointer hover:shadow-md" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

// Badge Component - Reusable status indicator
type BadgeProps = {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}, ref) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800"
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  return (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

// Icons for the Match-Up app
export const MatchUpIcons = {
  basketball: "🏀",
  bitcoin: "₿",
  star: "⭐",
  home: "🏠",
  dollar: "💵",
  search: "🔍",
  profile: "👤",
  target: "🎯",
  clock: "🕐",
  users: "👥",
  calendar: "📅",
  trophy: "🏆",
  chart: "📊",
  bell: "🔔",
  settings: "⚙️",
} as const;

// Type for icon names
export type IconName = keyof typeof MatchUpIcons;
