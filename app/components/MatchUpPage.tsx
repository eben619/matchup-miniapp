"use client";

import { useState } from "react";
import { CategoryButton, EventCard, Badge, MatchUpIcons } from "./MatchUpComponents";
import { Section } from "./LayoutComponents";
import { CreateMarketForm } from "./CreateMarketForm";
import { Button, Card, Input } from "./FormComponents";
import { MarketDetail } from "./MarketDetail";
import { useMarkets } from '../../lib/useMarkets';
import { useReadContract, useAccount } from 'wagmi';
import { MARKET_FACTORY_CONTRACT } from '../../lib/contract';
import { useUserPrediction, useHasUserPredicted, useMarketPredictionStats, useMarketData } from '../../lib/contract-hooks';
import { formatETH } from '../../lib/contract-hooks';

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

// Create Market Button Component
const CreateMarketButton = ({ onShowForm }: { onShowForm: () => void }) => {
  return (
    <Card className="text-center py-8">
      <h3 className="text-lg font-semibold mb-2">Create Your Own Market</h3>
      <p className="text-gray-600 mb-4">Start a new prediction market for sports or crypto events</p>
      <Button
        onClick={onShowForm}
        variant="primary"
        size="lg"
      >
        Create Market
      </Button>
    </Card>
  );
};

// Reusable Events List Component
const EventsList = ({ 
  activeCategory,
  showCreateForm,
  onShowCreateForm,
  onHideCreateForm,
  onMarketClick
}: { 
  activeCategory: string; 
  showCreateForm: boolean;
  onShowCreateForm: () => void;
  onHideCreateForm: () => void;
  onMarketClick: (market: any) => void;
}) => {
  const { markets, isLoading, error, refetch } = useMarkets();
  
  // Debug: Get total markets count directly
  const { data: totalMarkets, isLoading: totalMarketsLoading, error: totalMarketsError } = useReadContract({
    address: MARKET_FACTORY_CONTRACT.address,
    abi: MARKET_FACTORY_CONTRACT.abi,
    functionName: 'getTotalMarkets',
  });

  // Debug: Get next market ID
  const { data: nextMarketId, isLoading: nextMarketIdLoading, error: nextMarketIdError } = useReadContract({
    address: MARKET_FACTORY_CONTRACT.address,
    abi: MARKET_FACTORY_CONTRACT.abi,
    functionName: 'nextMarketId',
  });

  const filteredEvents = markets.filter(event => 
    activeCategory === "all" || event.category === activeCategory
  );

  const handleMarketSubmit = (data: any) => {
    console.log("Market created:", data);
    onHideCreateForm();
    // The markets will automatically refresh due to the useMarkets hook
  };

  const renderCustomContent = () => {
    if (showCreateForm) {
      return (
        <CreateMarketForm 
          onSubmit={handleMarketSubmit}
          onCancel={onHideCreateForm}
        />
      );
    }
    return <CreateMarketButton onShowForm={onShowCreateForm} />;
  };

  const renderEventList = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="p-6 text-center">
          <div className="text-red-500">
            <div className="text-4xl mb-2">❌</div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Markets</h3>
            <p>Failed to load markets. Please try again.</p>
          </div>
        </Card>
      );
    }

    if (filteredEvents.length === 0) {
  return (
        <div className="space-y-4">
          {/* Debug Info */}
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-yellow-800">🔍 Debug Info</h4>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Refresh
              </Button>
            </div>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>Total Markets: {totalMarketsLoading ? 'Loading...' : totalMarkets?.toString() || 'Error'}</div>
              <div>Next Market ID: {nextMarketIdLoading ? 'Loading...' : nextMarketId?.toString() || 'Error'}</div>
              <div>Fetched Markets: {markets.length}</div>
              <div>Filtered Events: {filteredEvents.length}</div>
              <div>Active Category: {activeCategory}</div>
              {markets.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-100 rounded">
                  <div className="font-semibold">Market Details:</div>
                  {markets.map((market, index) => (
                    <div key={index} className="text-xs">
                      ID: {market.id}, Title: {market.title}, Category: "{market.category}"
                    </div>
                  ))}
                </div>
              )}
              {totalMarketsError && <div className="text-red-600">Error: {totalMarketsError.message}</div>}
              {nextMarketIdError && <div className="text-red-600">Next ID Error: {nextMarketIdError.message}</div>}
            </div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="text-lg font-semibold mb-2">No Markets Found</h3>
              <p>No markets available in this category yet.</p>
              <p className="text-sm mt-2 text-blue-600">Go to custom category to create a market</p>
            </div>
          </Card>
        </div>
      );
    }

    return filteredEvents.map((event) => (
        <EventCard
          key={event.id}
          title={event.title}
          category={event.category}
          description={event.description}
          participants={event.participants}
          endDate={event.endDate}
          status={event.status}
        onClick={() => onMarketClick(event)}
      />
    ));
  };

  return (
    <div className="space-y-3">
      {activeCategory === "custom" ? renderCustomContent() : renderEventList()}
    </div>
  );
};

export function MatchUpPage() {
  const [activeCategory, setActiveCategory] = useState("crypto");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<any>(null);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setShowCreateForm(false); // Hide form when switching categories
    setSelectedMarket(null); // Hide market detail when switching categories
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
  };

  const handleHideCreateForm = () => {
    setShowCreateForm(false);
  };

  const handleMarketClick = (market: any) => {
    setSelectedMarket(market);
  };

  const handleBackToMarkets = () => {
    setSelectedMarket(null);
  };

  const handlePredictionSubmit = (prediction: any) => {
    console.log("Prediction submitted:", prediction);
    // In a real app, you would submit this to your API
    // For now, we'll just show a success message and go back
    alert("Prediction submitted successfully!");
    setSelectedMarket(null);
  };

  // Show market detail if a market is selected
  if (selectedMarket) {
    return (
      <MarketDetail
        marketId={selectedMarket.id}
        onBack={handleBackToMarkets}
        onSubmitPrediction={handlePredictionSubmit}
      />
    );
  }

  // Show market list
  return (
    <div className="space-y-6 animate-fade-in">
      <CategorySelection 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      <Section
        title={activeCategory === "all" ? "All Events" : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Events`}
        headerContent={
          <Badge variant="info" size="sm">
            {activeCategory === "all" ? "All" : activeCategory}
          </Badge>
        }
      >
        <EventsList 
          activeCategory={activeCategory}
          showCreateForm={showCreateForm}
          onShowCreateForm={handleShowCreateForm}
          onHideCreateForm={handleHideCreateForm}
          onMarketClick={handleMarketClick}
        />
      </Section>
    </div>
  );
}

// Pools Page Component - Shows all markets with search functionality
export function PoolsPage() {
  const { markets, isLoading, error } = useMarkets();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<any>(null);

  // Filter markets based on search term
  const filteredMarkets = markets.filter(market => 
    market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarketClick = (market: any) => {
    setSelectedMarket(market);
  };

  const handleBack = () => {
    setSelectedMarket(null);
  };

  // Show market detail if a market is selected
  if (selectedMarket) {
    return (
      <MarketDetail 
        marketId={selectedMarket.id} 
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">All Prediction Pools</h1>
        <p className="text-gray-600">Search and explore all available prediction markets</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <Input
          label=""
          type="text"
          placeholder="Search markets by title, description, or category..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full"
        />
      </div>

      {/* Markets List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <div className="text-red-500">
              <div className="text-4xl mb-2">❌</div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Markets</h3>
              <p>Failed to load markets. Please try again.</p>
            </div>
          </Card>
        ) : filteredMarkets.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "No Markets Found" : "No Markets Available"}
              </h3>
              <p>
                {searchTerm 
                  ? `No markets match your search for "${searchTerm}"`
                  : "No prediction markets have been created yet."
                }
              </p>
              {searchTerm && (
                <Button 
                  onClick={() => setSearchTerm("")}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            {/* Results Count */}
            <div className="text-sm text-gray-600 text-center">
              {searchTerm ? (
                <span>Found {filteredMarkets.length} market{filteredMarkets.length !== 1 ? 's' : ''} matching "{searchTerm}"</span>
              ) : (
                <span>Showing all {filteredMarkets.length} market{filteredMarkets.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {/* Markets Grid */}
            <div className="grid gap-4">
              {filteredMarkets.map((market) => (
                <EventCard
                  key={market.id}
                  title={market.title}
                  category={market.category}
                  description={market.description}
                  participants={market.participants}
                  endDate={market.endDate}
                  status={market.status}
                  onClick={() => handleMarketClick(market)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// My Bets Dashboard Component
export function MyBetsPage() {
  const { address } = useAccount();
  const { markets, isLoading: marketsLoading } = useMarkets();
  const [selectedMarket, setSelectedMarket] = useState<any>(null);

  // Filter markets where user has made predictions
  const userMarkets = markets.filter(market => {
    // This would need to be enhanced to actually check if user predicted
    // For now, we'll show all markets as potential bets
    return true;
  });

  const handleMarketClick = (market: any) => {
    setSelectedMarket(market);
  };

  const handleBack = () => {
    setSelectedMarket(null);
  };

  // Show market detail if a market is selected
  if (selectedMarket) {
    return (
      <MarketDetail 
        marketId={selectedMarket.id} 
        onBack={handleBack}
      />
    );
  }

  if (!address) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <div className="text-4xl mb-2">🔗</div>
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p>Connect your wallet to view your prediction history and active bets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Bets Dashboard</h1>
        <p className="text-gray-600">Track your predictions and winnings</p>
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {userMarkets.length}
          </div>
          <div className="text-sm text-gray-600">Total Markets</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {userMarkets.filter(m => m.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Bets</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {userMarkets.filter(m => m.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </Card>
      </div>

      {/* User's Markets */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Prediction Markets</h2>
        
        {marketsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : userMarkets.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold mb-2">No Bets Yet</h3>
              <p>You haven't made any predictions yet. Start by exploring the markets!</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {userMarkets.map((market) => (
              <UserBetCard
                key={market.id}
                market={market}
                userAddress={address}
                onClick={() => handleMarketClick(market)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// User Bet Card Component
function UserBetCard({ 
  market, 
  userAddress, 
  onClick 
}: { 
  market: any; 
  userAddress: string; 
  onClick: () => void; 
}) {
  const { prediction, isLoading: predictionLoading } = useUserPrediction(market.id, userAddress);
  const { hasPredicted, isLoading: hasPredictedLoading } = useHasUserPredicted(market.id, userAddress);
  const { stats, isLoading: statsLoading } = useMarketPredictionStats(market.id);

  const getOutcomeText = (outcome: number) => {
    switch (outcome) {
      case 0: return "No";
      case 1: return "Yes";
      default: return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{market.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{market.description}</p>
        </div>
        <Badge className={getStatusColor(market.status)}>
          {market.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Category</div>
          <div className="font-medium capitalize">{market.category}</div>
        </div>
        <div>
          <div className="text-gray-500">End Date</div>
          <div className="font-medium">{market.endDate}</div>
        </div>
      </div>

      {/* User's Prediction Info */}
      {hasPredictedLoading ? (
        <div className="mt-3 text-sm text-gray-500">Loading prediction...</div>
      ) : hasPredicted ? (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-1">Your Prediction</div>
          {predictionLoading ? (
            <div className="text-sm text-blue-700">Loading details...</div>
          ) : prediction ? (
            <div className="text-sm text-blue-700">
              <div>Outcome: <span className="font-medium">{getOutcomeText(Number(prediction.outcome))}</span></div>
              <div>Amount: <span className="font-medium">{formatETH(prediction.betAmountETH)} ETH</span></div>
              <div>Status: <span className="font-medium">{prediction.isClaimed ? "Claimed" : "Unclaimed"}</span></div>
            </div>
          ) : (
            <div className="text-sm text-blue-700">Prediction details not available</div>
          )}
        </div>
      ) : (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">No prediction made yet</div>
        </div>
      )}

      {/* Market Stats */}
      {statsLoading ? (
        <div className="mt-3 text-sm text-gray-500">Loading market stats...</div>
      ) : stats ? (
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium">{Number(stats.totalPredictions)}</div>
            <div className="text-gray-500">Predictions</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{formatETH(stats.totalPoolETH)}</div>
            <div className="text-gray-500">Total Pool</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{Number(stats.uniquePredictors)}</div>
            <div className="text-gray-500">Predictors</div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
