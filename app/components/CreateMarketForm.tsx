"use client";

import { useState, useEffect } from "react";
import { 
  Form, 
  Input, 
  Textarea, 
  Select, 
  Button, 
  FormActions, 
  Grid, 
  Card 
} from "./FormComponents";
import { useCreateMarket } from "../../lib/contract-hooks";
import { useAccount } from "wagmi";

type MarketFormData = {
  title: string;
  category: string;
  description: string;
  endDate: string;
  marketType: string;
  betAmountETH: string;
  settlementSource: string;
}

type CreateMarketFormProps = {
  onSubmit?: (data: MarketFormData) => void;
  onCancel?: () => void;
}

export function CreateMarketForm({ onSubmit, onCancel }: CreateMarketFormProps) {
  const { address } = useAccount();
  const { createMarket, isLoading, isSuccess, error } = useCreateMarket();
  
  const [ethPrice] = useState(2000); // Default ETH price in USD
  const [formData, setFormData] = useState<MarketFormData>({
    title: "",
    category: "sports",
    description: "",
    endDate: "",
    marketType: "binary",
    betAmountETH: "",
    settlementSource: ""
  });

  // Calculate ETH equivalent when USD amount changes
  const calculateEthEquivalent = (usdAmount: string) => {
    if (!usdAmount || parseFloat(usdAmount) < 0.5) return "";
    const ethAmount = parseFloat(usdAmount) / ethPrice;
    return ethAmount.toFixed(6);
  };

  // Calculate USD equivalent when ETH amount changes
  const calculateUsdEquivalent = (ethAmount: string) => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) return "";
    const usdAmount = parseFloat(ethAmount) * ethPrice;
    return usdAmount.toFixed(2);
  };

  // Handle successful market creation
  useEffect(() => {
    if (isSuccess) {
      onSubmit?.(formData);
      // Reset form
      setFormData({
        title: "",
        category: "sports",
        description: "",
        endDate: "",
        marketType: "binary",
        betAmountETH: "",
        settlementSource: ""
      });
    }
  }, [isSuccess, onSubmit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    // Validate form data
    if (!formData.title.trim()) {
      alert("Please enter a market title");
      return;
    }
    if (!formData.description.trim()) {
      alert("Please enter a market description");
      return;
    }
    if (!formData.betAmountETH || parseFloat(formData.betAmountETH) <= 0) {
      alert("Please enter a valid ETH bet amount");
      return;
    }
    if (!formData.endDate) {
      alert("Please select an end date");
      return;
    }
    if (!formData.settlementSource.trim()) {
      alert("Please enter a settlement source URL");
      return;
    }

    try {
      // Convert end date to Unix timestamp
      const endTime = Math.floor(new Date(formData.endDate).getTime() / 1000);
      
      console.log("Creating market with data:", {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        betAmountETH: formData.betAmountETH,
        endTime,
        settlementSource: formData.settlementSource,
      });
      
      // Add network check
      console.log("Current network check - please verify you're on Base mainnet");
      console.log("Contract address:", "0xf212600617f594bae7a4011f068b314f70a7bb72");
      console.log("Expected network: Base mainnet (Chain ID: 8453)");
      
      await createMarket({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        betAmountETH: formData.betAmountETH,
        endTime,
        settlementSource: formData.settlementSource,
        tags: [], // Empty tags array for now
      });
    } catch (err) {
      console.error("Error creating market:", err);
      console.error("Full error details:", err);
      
      // More specific error handling
      if (err.message?.includes("Transaction does not have a transaction hash")) {
        alert("Transaction failed - please check your network connection and ensure you're on Base mainnet. Try refreshing the page and connecting your wallet again.");
      } else if (err.message?.includes("User rejected")) {
        alert("Transaction was cancelled by user");
      } else if (err.message?.includes("insufficient funds")) {
        alert("Insufficient funds for transaction");
      } else {
        alert(`Failed to create market: ${err.message || "Unknown error"}`);
      }
    }
  };

  const handleCancel = () => {
    onCancel?.();
    // Reset form
    setFormData({
      title: "",
      category: "sports",
      description: "",
      endDate: "",
      marketType: "binary",
      betAmountUSDC: "",
      betAmountETH: "",
      settlementSource: ""
    });
  };

  const categoryOptions = [
    { value: "sports", label: "Sports" },
    { value: "crypto", label: "Crypto" }
  ];

  const marketTypeOptions = [
    { value: "binary", label: "Binary (Yes/No)" },
    { value: "multiple", label: "Multiple Choice" },
    { value: "scalar", label: "Scalar (Range)" }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Create New Market</h3>
      
      <Form onSubmit={handleSubmit}>
        <Input
          label="Market Title"
          type="text"
          value={formData.title}
          onChange={(value) => setFormData({ ...formData, title: value })}
          placeholder="e.g., Bitcoin will reach $100k by end of year"
          required
        />

        <Select
          label="Category"
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value })}
          options={categoryOptions}
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="Describe the prediction market..."
          rows={3}
        />

        <Input
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={(value) => setFormData({ ...formData, endDate: value })}
          required
        />

        <Select
          label="Market Type"
          value={formData.marketType}
          onChange={(value) => setFormData({ ...formData, marketType: value })}
          options={marketTypeOptions}
        />

        <Input
          label="Bet Amount (USD)"
          type="number"
          value={formData.betAmountETH ? calculateUsdEquivalent(formData.betAmountETH) : ""}
          onChange={(value) => {
            const ethAmount = calculateEthEquivalent(value);
            setFormData({ 
              ...formData, 
              betAmountETH: ethAmount
            });
          }}
          placeholder="1.00"
          min={0.5}
          step={0.01}
          required
          helperText="Minimum $0.50 (ETH amount auto-calculated)"
        />
        <Input
          label="Bet Amount (ETH)"
          type="number"
          value={formData.betAmountETH}
          onChange={(value) => {
            setFormData({ 
              ...formData, 
              betAmountETH: value
            });
          }}
          placeholder="0.0005"
          min={0}
          step={0.000001}
          helperText="Auto-calculated from USD amount"
        />

        <Input
          label="Settlement Source"
          type="url"
          value={formData.settlementSource}
          onChange={(value) => setFormData({ ...formData, settlementSource: value })}
          placeholder="https://www.coingecko.com/en/coins/bitcoin"
          required
          helperText="URL where outcome data will be sourced from"
        />

        <div className="mt-2 text-xs text-gray-600">
          <p className="font-medium mb-1">Examples:</p>
          <ul className="space-y-1 text-gray-500">
            <li>• <strong>Crypto:</strong> CoinGecko, CoinMarketCap, or exchange APIs</li>
            <li>• <strong>Sports:</strong> ESPN, official league websites, or sports data APIs</li>
            <li>• <strong>Other:</strong> Official government sites, news sources, or verified data providers</li>
          </ul>
          <p className="mt-2 text-gray-500">
            This URL will be used to verify the outcome and settle the market.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Error: {error.message || "Failed to create market"}
            </p>
          </div>
        )}

        {isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">
              ✅ Market created successfully! It will appear in the markets list shortly.
            </p>
          </div>
        )}

        <FormActions>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Creating Market..." : "Create Market"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            fullWidth
            disabled={isLoading}
          >
            Cancel
          </Button>
        </FormActions>
      </Form>
    </Card>
  );
}
