"use client";

import { forwardRef, type ReactNode } from "react";

// Reusable Input Component
type InputProps = {
  label: string;
  type?: "text" | "email" | "password" | "number" | "url" | "date";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  className?: string;
  helperText?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  step,
  className = "",
  helperText,
  error,
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

// Reusable Textarea Component
type TextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
  className = "",
  helperText,
  error,
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

// Reusable Select Component
type SelectOption = {
  value: string;
  label: string;
}

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
  className?: string;
  helperText?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  value,
  onChange,
  options,
  required = false,
  className = "",
  helperText,
  error,
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

// Reusable Form Component
type FormProps = {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(({
  children,
  onSubmit,
  className = "",
  ...props
}, ref) => {
  return (
    <form
      ref={ref}
      onSubmit={onSubmit}
      className={`space-y-4 ${className}`}
      {...props}
    >
      {children}
    </form>
  );
});

Form.displayName = "Form";

// Reusable Form Actions Component
type FormActionsProps = {
  children: ReactNode;
  className?: string;
}

export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(({
  children,
  className = "",
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`flex space-x-3 pt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

FormActions.displayName = "FormActions";

// Reusable Button Component (enhanced version)
type ButtonProps = {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  ...props
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary: "bg-yellow-400 hover:bg-yellow-500 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
    outline: "border border-yellow-400 hover:bg-yellow-50 text-yellow-400",
    ghost: "hover:bg-gray-100 text-gray-600",
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
      {children}
    </button>
  );
});

Button.displayName = "Button";

// Reusable Grid Component
type GridProps = {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "none" | "sm" | "md" | "lg";
  className?: string;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(({
  children,
  cols = 1,
  gap = "md",
  className = "",
  ...props
}, ref) => {
  const colsClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6"
  };

  const gapClasses = {
    none: "",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6"
  };

  return (
    <div
      ref={ref}
      className={`grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Grid.displayName = "Grid";

// Reusable Card Component
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  if (onClick) {
    return (
      <button
        ref={ref as React.LegacyRef<HTMLButtonElement>}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={`rounded-lg p-4 transition-all ${variantClasses[variant]} cursor-pointer hover:shadow-md ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      ref={ref}
      className={`rounded-lg p-4 transition-all ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";
