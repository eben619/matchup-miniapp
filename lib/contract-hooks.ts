import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { MARKET_FACTORY_CONTRACT, type MarketData, type MarketStats } from './contract';

// Market Factory Contract Configuration (for market creation)
const marketFactoryConfig = {
  address: MARKET_FACTORY_CONTRACT.address,
  abi: MARKET_FACTORY_CONTRACT.abi,
} as const;

// Prediction Manager Contract Configuration (for predictions)
const PREDICTION_MANAGER_CONTRACT = {
  address: "0x487ab07cda72040aad625c6b996c06115fd27e12" as const,
  abi: [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_marketId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_outcome",
          "type": "uint256"
        }
      ],
      "name": "makePrediction",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_marketId",
          "type": "uint256"
        }
      ],
      "name": "claimWinnings",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "_marketIds",
          "type": "uint256[]"
        }
      ],
      "name": "batchClaimWinnings",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_marketId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "hasUserPredicted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_marketId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserPrediction",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "predictor",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "marketId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "outcome",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "betAmountETH",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isClaimed",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "predictedPrice",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "predictionHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct PredictionManager.Prediction",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_marketId",
          "type": "uint256"
        }
      ],
      "name": "getMarketPredictionStats",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "totalPredictions",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalPoolETH",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "yesBets",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "noBets",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "uniquePredictors",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "avgBetAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastPredictionTime",
              "type": "uint256"
            }
          ],
          "internalType": "struct PredictionManager.MarketPredictionStats",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
} as const;

const predictionConfig = {
  address: PREDICTION_MANAGER_CONTRACT.address,
  abi: PREDICTION_MANAGER_CONTRACT.abi,
} as const;

// Helper functions for formatting
export const formatETH = (amount: bigint) => formatEther(amount);

// Hook for creating a market
export function useCreateMarket() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });



  const createMarket = async (marketData: {
    title: string;
    description: string;
    category: string;
    betAmountETH: string;
    endTime: number;
    settlementSource: string;
    tags?: string[];
  }) => {
    try {
      console.log('Creating market with data:', marketData);
      console.log('Parsed ETH amount:', parseEther(marketData.betAmountETH));
      console.log('End time:', BigInt(marketData.endTime));
      
      // Validate parameters before sending
      const betAmountWei = parseEther(marketData.betAmountETH);
      const endTimeBigInt = BigInt(marketData.endTime);
      const currentTime = BigInt(Math.floor(Date.now() / 1000));
      
      console.log('Parameter validation:');
      console.log('- Title length:', marketData.title.length);
      console.log('- Description length:', marketData.description.length);
      console.log('- Category:', marketData.category);
      console.log('- Bet amount (wei):', betAmountWei.toString());
      console.log('- End time:', endTimeBigInt.toString());
      console.log('- Current time:', currentTime.toString());
      console.log('- Time until end:', (endTimeBigInt - currentTime).toString());
      console.log('- Settlement source length:', marketData.settlementSource.length);
      console.log('- Tags:', marketData.tags || []);
      
      // Check if end time is in the future
      if (endTimeBigInt <= currentTime) {
        throw new Error('End time must be in the future');
      }
      
      // Check minimum time (1 hour = 3600 seconds)
      const minEndTime = currentTime + BigInt(3600);
      if (endTimeBigInt < minEndTime) {
        throw new Error('Market must end at least 1 hour from now');
      }
      
      writeContract({
        ...marketFactoryConfig,
        functionName: 'createMarket',
        args: [
          marketData.title,
          marketData.description,
          marketData.category,
          betAmountWei,
          endTimeBigInt,
          marketData.settlementSource,
          marketData.tags || [], // Default to empty array if no tags provided
        ],
      });
    } catch (err) {
      console.error('Error creating market:', err);
      throw err;
    }
  };

  return {
    createMarket,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
  };
}

// Hook for making a prediction
export function useMakePrediction() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const makePrediction = async (marketId: number, outcome: 0 | 1, betAmountETH: string) => {
    try {
      console.log('Making prediction:', { marketId, outcome, betAmountETH });
      console.log('Prediction contract address:', predictionConfig.address);
      console.log('MarketFactory contract address:', marketFactoryConfig.address);
      console.log('⚠️  WARNING: Prediction contract may be on wrong network!');
      writeContract({
        ...predictionConfig,
        functionName: 'makePrediction',
        args: [BigInt(marketId), BigInt(outcome)],
        value: parseEther(betAmountETH),
      });
    } catch (err) {
      console.error('Error making prediction:', err);
      throw err;
    }
  };

  return {
    makePrediction,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
  };
}

// Hook for claiming winnings
export function useClaimWinnings() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimWinnings = async (marketId: number) => {
    try {
      writeContract({
        ...predictionConfig,
        functionName: 'claimWinnings',
        args: [BigInt(marketId)],
      });
    } catch (err) {
      console.error('Error claiming winnings:', err);
      throw err;
    }
  };

  return {
    claimWinnings,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
  };
}

// Hook for getting market data
export function useMarketData(marketId: number | null) {
  const { data: marketResult, error, isLoading } = useReadContract({
    ...marketFactoryConfig,
    functionName: 'getMarket',
    args: marketId ? [BigInt(marketId)] : undefined,
    query: {
      enabled: marketId !== null,
    },
  });

  if (!marketResult || !marketId) {
    return {
      market: null,
      stats: null,
      error,
      isLoading,
    };
  }

  // The new contract returns both market and stats in one call
  const [marketData, marketStats] = marketResult;

  const market: MarketData = {
    id: marketData.id,
    title: marketData.title,
    description: marketData.description,
    category: marketData.category,
    betAmountETH: marketData.betAmountETH,
    endTime: marketData.endTime,
    isResolved: marketData.isResolved,
    settlementSource: marketData.settlementSource,
    creator: marketData.creator,
    createdAt: marketData.createdAt,
    winningOutcome: marketData.winningOutcome,
    isActive: marketData.isActive,
    tags: [...marketData.tags],
  };

  const stats: MarketStats = {
    totalPredictions: marketStats.totalPredictions,
    totalPoolETH: marketStats.totalPoolETH,
    yesBets: marketStats.yesBets,
    noBets: marketStats.noBets,
    uniquePredictors: marketStats.uniquePredictors,
  };

  return {
    market,
    stats,
    error,
    isLoading,
  };
}

// Hook for getting all markets
export function useAllMarkets() {
  const { data: nextMarketId, error: nextIdError, isLoading: nextIdLoading } = useReadContract({
    ...marketFactoryConfig,
    functionName: 'nextMarketId',
  });

  // Create array of market IDs to fetch
  const marketIds = nextMarketId ? Array.from({ length: Number(nextMarketId) }, (_, i) => i + 1) : [];

  // For now, we'll return empty markets array
  // In a production app, you'd use multicall or batch requests to fetch all markets
  const markets: (MarketData & { stats?: MarketStats })[] = [];

  return {
    markets,
    error: nextIdError,
    isLoading: nextIdLoading,
    totalMarkets: marketIds.length,
  };
}

// Hook for checking if user has predicted on a market
export function useHasUserPredicted(marketId: number | null, userAddress: string | undefined) {
  const { data: hasPredicted, error, isLoading } = useReadContract({
    ...predictionConfig,
    functionName: 'hasUserPredicted',
    args: marketId && userAddress ? [BigInt(marketId), userAddress as `0x${string}`] : undefined,
    query: {
      enabled: marketId !== null && userAddress !== undefined,
    },
  });

  return {
    hasPredicted: hasPredicted || false,
    error,
    isLoading,
  };
}

// Hook for getting market prediction stats from prediction contract
export function useMarketPredictionStats(marketId: number | null) {
  const { data: stats, error, isLoading } = useReadContract({
    ...predictionConfig,
    functionName: 'getMarketPredictionStats',
    args: marketId ? [BigInt(marketId)] : undefined,
    query: {
      enabled: marketId !== null,
    },
  });

  return {
    stats,
    error,
    isLoading,
  };
}

// Hook for getting market predictions
export function useMarketPredictions(marketId: number | null) {
  const { data: predictionCount, error: countError, isLoading: countLoading } = useReadContract({
    ...predictionConfig,
    functionName: 'getMarketPredictionStats',
    args: marketId ? [BigInt(marketId)] : undefined,
    query: {
      enabled: marketId !== null,
    },
  });

  const predictions: any[] = [];
  const isLoading = countLoading;
  const error = countError;

  // Note: In a production app, you'd want to fetch all predictions
  // For now, we'll just return the count and empty array
  return {
    predictions,
    predictionCount: predictionCount ? Number(predictionCount) : 0,
    error,
    isLoading,
  };
}

// Hook for getting user's prediction on a specific market
export function useUserPrediction(marketId: number | null, userAddress: string | undefined) {
  const { data: prediction, error, isLoading } = useReadContract({
    ...predictionConfig,
    functionName: 'getUserPrediction',
    args: marketId && userAddress ? [BigInt(marketId), userAddress as `0x${string}`] : undefined,
    query: {
      enabled: marketId !== null && userAddress !== undefined,
    },
  });

  return {
    prediction,
    error,
    isLoading,
  };
}

// Hook for testing contract connection
export function useContractTest() {
  const { data: totalMarkets, isLoading, error } = useReadContract({
    address: MARKET_FACTORY_CONTRACT.address,
    abi: MARKET_FACTORY_CONTRACT.abi,
    functionName: 'getTotalMarkets',
  });

  const { data: nextMarketId, isLoading: nextIdLoading, error: nextIdError } = useReadContract({
    address: MARKET_FACTORY_CONTRACT.address,
    abi: MARKET_FACTORY_CONTRACT.abi,
    functionName: 'nextMarketId',
  });

  const { data: minBetAmount, isLoading: minBetLoading, error: minBetError } = useReadContract({
    address: MARKET_FACTORY_CONTRACT.address,
    abi: MARKET_FACTORY_CONTRACT.abi,
    functionName: 'minBetAmount',
  });

  const { data: maxBetAmount, isLoading: maxBetLoading, error: maxBetError } = useReadContract({
    address: MARKET_FACTORY_CONTRACT.address,
    abi: MARKET_FACTORY_CONTRACT.abi,
    functionName: 'maxBetAmount',
  });

  return {
    totalMarkets,
    nextMarketId,
    minBetAmount,
    maxBetAmount,
    isLoading: Boolean(isLoading || nextIdLoading || minBetLoading || maxBetLoading),
    error: error || nextIdError || minBetError || maxBetError,
  };
};
