"use client";

import { type ReactNode, forwardRef } from "react";
import { NavigationItem } from "./MatchUpComponents";

// Reusable Header Component
type HeaderProps = {
  title: string;
  logo?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(({
  title,
  logo,
  rightContent,
  className = "",
  ...props
}, ref) => {
  return (
    <header
      ref={ref}
      className={`flex justify-between items-center mb-4 h-12 ${className}`}
      {...props}
    >
      <div className="flex items-center space-x-2">
        {logo || (
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
        )}
        <span className="text-xl font-bold text-gray-900">{title}</span>
      </div>
      {rightContent && (
        <div className="flex items-center space-x-2">
          {rightContent}
        </div>
      )}
    </header>
  );
});

Header.displayName = "Header";

// Reusable Bottom Navigation Component
type BottomNavigationProps = {
  items: Array<{
    id: string;
    icon: ReactNode;
    label: string;
    badge?: ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(({
  items,
  activeTab,
  onTabChange,
  className = "",
  ...props
}, ref) => {
  return (
    <footer
      ref={ref}
      className={`mt-auto pt-4 border-t border-gray-200 ${className}`}
      {...props}
    >
      <div className="flex justify-around">
        {items.map((item) => (
          <NavigationItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
            badge={item.badge}
          />
        ))}
      </div>
    </footer>
  );
});

BottomNavigation.displayName = "BottomNavigation";

// Reusable Page Container Component
type PageContainerProps = {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(({
  children,
  maxWidth = "md",
  padding = "md",
  className = "",
  ...props
}, ref) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl"
  };

  const paddingClasses = {
    none: "",
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4"
  };

  return (
    <div
      ref={ref}
      className={`w-full ${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

PageContainer.displayName = "PageContainer";

// Reusable Section Component
type SectionProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerContent?: ReactNode;
}

export const Section = forwardRef<HTMLElement, SectionProps>(({
  children,
  title,
  subtitle,
  className = "",
  headerContent,
  ...props
}, ref) => {
  return (
    <section
      ref={ref}
      className={`space-y-4 ${className}`}
      {...props}
    >
      {(title || subtitle || headerContent) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {headerContent}
        </div>
      )}
      {children}
    </section>
  );
});

Section.displayName = "Section";

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

// Reusable Flex Component
type FlexProps = {
  children: ReactNode;
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly";
  align?: "start" | "end" | "center" | "baseline" | "stretch";
  wrap?: "wrap" | "wrap-reverse" | "nowrap";
  gap?: "none" | "sm" | "md" | "lg";
  className?: string;
}

export const Flex = forwardRef<HTMLDivElement, FlexProps>(({
  children,
  direction = "row",
  justify = "start",
  align = "start",
  wrap = "nowrap",
  gap = "none",
  className = "",
  ...props
}, ref) => {
  const directionClasses = {
    row: "flex-row",
    col: "flex-col",
    "row-reverse": "flex-row-reverse",
    "col-reverse": "flex-col-reverse"
  };

  const justifyClasses = {
    start: "justify-start",
    end: "justify-end",
    center: "justify-center",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly"
  };

  const alignClasses = {
    start: "items-start",
    end: "items-end",
    center: "items-center",
    baseline: "items-baseline",
    stretch: "items-stretch"
  };

  const wrapClasses = {
    wrap: "flex-wrap",
    "wrap-reverse": "flex-wrap-reverse",
    nowrap: "flex-nowrap"
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
      className={`flex ${directionClasses[direction]} ${justifyClasses[justify]} ${alignClasses[align]} ${wrapClasses[wrap]} ${gapClasses[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Flex.displayName = "Flex";
