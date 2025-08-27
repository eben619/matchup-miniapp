"use client";

import { useState, useMemo } from "react";
import { Button, CategoryButton, EventCard, Card, Badge, MatchUpIcons } from "./MatchUpComponents";
import { Section, Grid, Flex } from "./LayoutComponents";

type MatchUpPageProps = {
  setActiveTab: (tab: string) => void;
};

// Reusable Category Selection Component
const CategorySelection = ({ 
  activeCategory, 
  onCategoryChange 
}: { 
  activeCategory: string; 
  onCategoryChange: (category: string) => void; 
}) => {
  const categories = [
    { id: "sports", label: "Sports", icon: MatchUpIcons.basketball },
    { id: "crypto", label: "Crypto", icon: MatchUpIcons.bitcoin },
    { id: "custom", label: "Custom", icon: MatchUpIcons.star }
  ];

  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {categories.map((category) => (
        <CategoryButton
          key={category.id}
          icon={category.icon}
          isActive={activeCategory === category.id}
          onClick={() => onCategoryChange(category.id)}
          className="w-full"
        >
          {category.label}
        </CategoryButton>
      ))}
    </div>
  );
};

// Reusable Events List Component
const EventsList = ({ 
  activeCategory 
}: { 
  activeCategory: string; 
}) => {
  const events = useMemo(() => [
    {
      id: 1,
      title: "BTC > $60k by Sept 1",
      category: "crypto",
      description: "Ends in 45 days",
      participants: 1234,
      endDate: "Sept 1",
      status: "active" as const
    },
    {
      id: 2,
      title: "Ethereum Merge Success",
      category: "crypto",
      description: "Ends in 12 days",
      participants: 2567,
      endDate: "Dec 15",
      status: "active" as const
    },
    {
      id: 3,
      title: "Lakers Win NBA Championship",
      category: "sports",
      description: "Ends in 180 days",
      participants: 3890,
      endDate: "June 2024",
      status: "upcoming" as const
    }
  ], []);

  const filteredEvents = events.filter(event => 
    activeCategory === "all" || event.category === activeCategory
  );

  return (
    <div className="space-y-3">
      {filteredEvents.map((event) => (
        <EventCard
          key={event.id}
          title={event.title}
          category={event.category}
          description={event.description}
          participants={event.participants}
          endDate={event.endDate}
          status={event.status}
          onClick={() => console.log(`Clicked on event: ${event.title}`)}
        />
      ))}
    </div>
  );
};

export function MatchUpPage({ setActiveTab }: MatchUpPageProps) {
  const [activeCategory, setActiveCategory] = useState("crypto");

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <CategorySelection 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      <Section
        title={`${activeCategory === "all" ? "All Events" : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Events`}`}
        headerContent={
          <Badge variant="info" size="sm">
            {activeCategory === "all" ? "All" : activeCategory}
          </Badge>
        }
      >
        <EventsList activeCategory={activeCategory} />
      </Section>
    </div>
  );
}
