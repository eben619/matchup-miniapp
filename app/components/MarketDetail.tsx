"use client";

import { useState } from "react";
import { 
  Button, 
  Card, 
  Form, 
  FormActions
} from "./FormComponents";
import { Badge, MatchUpIcons } from "./MatchUpComponents";
import { useMakePrediction, useMarketData, useHasUserPredicted, useMarketPredictionStats, formatETH } from "../../lib/contract-hooks";
import { useAccount } from "wagmi";

type MarketDetailProps = {
  readonly marketId: number;
  readonly onBack: () => void;
  readonly onSubmitPrediction?: (prediction: any) => void;
}

// Binary prediction component (Yes/No)
const BinaryPrediction = ({ 
  market, 
  onSubmit,
  isLoading 
}: { 
  market: any; 
  onSubmit: (prediction: any) => void;
  isLoading: boolean;
}) => {
  const { address } = useAccount();
  const { makePrediction, isLoading: isMakingPrediction } = useMakePrediction();
  const [selectedOption, setSelectedOption] = useState<"yes" | "no" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption || !address) return;
    
    try {
      const outcome = selectedOption === "yes" ? 1 : 0;
      await makePrediction(market.id, outcome, formatETH(market.betAmountETH));
      
      onSubmit({
        marketId: market.id,
        prediction: selectedOption,
        betAmount: formatETH(market.betAmountETH),
        marketType: "binary"
      });
    } catch (err) {
      console.error("Error making prediction:", err);
      alert("Failed to make prediction. Please try again.");
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Make Your Prediction</h3>
      
      <Form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Your Prediction
              </legend>
              <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedOption("yes")}
                className={`p-2 rounded-md border-2 transition-colors ${
                  selectedOption === "yes"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="text-sm mb-0.5">✅</div>
                  <div className="text-xs font-medium">Yes</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOption("no")}
                className={`p-2 rounded-md border-2 transition-colors ${
                  selectedOption === "no"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="text-sm mb-0.5">❌</div>
                  <div className="text-xs font-medium">No</div>
                </div>
              </button>
              </div>
            </fieldset>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Bet Amount:</span>
              <span className="text-lg font-bold text-gray-900">{formatETH(market.betAmountETH)} ETH</span>
            </div>
          </div>

          <FormActions>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!selectedOption || isMakingPrediction}
            >
              {isMakingPrediction ? "Placing Prediction..." : "Place Prediction"}
            </Button>
          </FormActions>
        </div>
      </Form>
    </Card>
  );
};

export function MarketDetail({ marketId, onBack, onSubmitPrediction }: MarketDetailProps) {
  const { address } = useAccount();
  const { market, error, isLoading } = useMarketData(marketId);
  const { stats: predictionStats } = useMarketPredictionStats(marketId);
  const { hasPredicted } = useHasUserPredicted(marketId, address);

  const handlePredictionSubmit = (prediction: any) => {
    console.log("Prediction submitted:", prediction);
    onSubmitPrediction?.(prediction);
  };

  const renderPredictionForm = () => {
    if (!market) return null;
    
    // For now, we only support binary markets
    return <BinaryPrediction market={market} onSubmit={handlePredictionSubmit} isLoading={isLoading} />;
  };

  const getStatusColor = (isResolved: boolean, endTime: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    if (isResolved) return "default";
    return Number(endTime) > now ? "success" : "default";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "sports": return MatchUpIcons.basketball;
      case "crypto": return MatchUpIcons.bitcoin;
      default: return MatchUpIcons.star;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <span>←</span>
          <span>Back to Markets</span>
        </Button>
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
          <span>←</span>
          <span>Back to Markets</span>
        </Button>
        <Card className="p-6 text-center">
          <div className="text-red-500">
            <div className="text-4xl mb-2">❌</div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Market</h3>
            <p>Failed to load market data. Please try again.</p>
          </div>
        </Card>
      </div>
    );
  }

  const isActive = !market.isResolved && Number(market.endTime) > Math.floor(Date.now() / 1000);
  const canPredict = isActive && !hasPredicted && address;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center space-x-2"
      >
        <span>←</span>
        <span>Back to Markets</span>
      </Button>

      {/* Market Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCategoryIcon(market.category)}</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{market.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getStatusColor(market.isResolved, market.endTime)} size="sm">
                  {(() => {
                    if (market.isResolved) return "resolved";
                    return isActive ? "active" : "ended";
                  })()}
                </Badge>
                <Badge variant="info" size="sm">
                  {market.category}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {market.description && (
          <p className="text-gray-600 mb-4">{market.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">End Date:</span>
            <span className="ml-2 font-medium">{new Date(Number(market.endTime) * 1000).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Participants:</span>
            <span className="ml-2 font-medium">{predictionStats?.totalPredictions.toString() || "0"}</span>
          </div>
          <div>
            <span className="text-gray-500">Bet Amount:</span>
            <span className="ml-2 font-medium">{formatETH(market.betAmountETH)} ETH</span>
          </div>
        </div>

        {predictionStats && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Yes Bets:</span>
                <span className="ml-2 font-medium">{formatETH(predictionStats.yesBets)} ETH</span>
              </div>
              <div>
                <span className="text-gray-500">No Bets:</span>
                <span className="ml-2 font-medium">{formatETH(predictionStats.noBets)} ETH</span>
              </div>
            </div>
          </div>
        )}

        {market.settlementSource && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-gray-500 text-sm">Settlement Source:</span>
            <a 
              href={market.settlementSource} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-800 text-sm break-all"
            >
              {market.settlementSource}
            </a>
          </div>
        )}
      </Card>

      {/* Prediction Form */}
      {canPredict && renderPredictionForm()}

      {/* Already Predicted Message */}
      {hasPredicted && (
        <Card className="p-6 text-center">
          <div className="text-green-500">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-lg font-semibold mb-2">Prediction Submitted</h3>
            <p>You have already made a prediction on this market.</p>
          </div>
        </Card>
      )}

      {/* Market Closed Message */}
      {!canPredict && !hasPredicted && (
        <Card className="p-6 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="text-lg font-semibold mb-2">
              {(() => {
                if (market.isResolved) return "Market Resolved";
                if (!isActive) return "Market Closed";
                return "Connect Wallet";
              })()}
            </h3>
            <p>
              {(() => {
                if (market.isResolved) return "This market has been resolved.";
                if (!isActive) return "This market has ended and is no longer accepting predictions.";
                return "Please connect your wallet to make a prediction.";
              })()}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}