import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useWatchContractEvent, usePublicClient, useChainId } from 'wagmi';
import { MARKET_FACTORY_CONTRACT } from './contract';
import { formatETH } from './contract-hooks';

export function useMarkets() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();
  const chainId = useChainId();

  // Get total number of markets
  const { data: totalMarkets, isLoading: isLoadingCount, error: totalMarketsError } = useReadContract({
    address: MARKET_FACTORY_CONTRACT.address,
    abi: MARKET_FACTORY_CONTRACT.abi,
    functionName: 'getTotalMarkets',
  });

  // Debug logging
  useEffect(() => {
    console.log('=== MARKET FETCHING DEBUG ===');
    console.log('Chain ID:', chainId);
    console.log('Expected Base Chain ID: 8453');
    console.log('Total Markets:', totalMarkets);
    console.log('isLoadingCount:', isLoadingCount);
    console.log('totalMarketsError:', totalMarketsError);
    console.log('Contract address:', MARKET_FACTORY_CONTRACT.address);
    console.log('Public client:', publicClient);
    console.log('=============================');
  }, [totalMarkets, isLoadingCount, totalMarketsError, publicClient, chainId]);

  // Watch for new market creation events (only when public client is available)
  useWatchContractEvent({
    address: MARKET_FACTORY_CONTRACT.address,
    abi: MARKET_FACTORY_CONTRACT.abi,
    eventName: 'MarketCreated',
    enabled: !!publicClient,
    onLogs(logs) {
      console.log('New market created:', logs);
      // Wait a bit for the transaction to be fully mined before refreshing
      setTimeout(() => {
        fetchMarkets();
      }, 2000);
    },
  });

  const fetchMarkets = useCallback(async () => {
    // Check if we're on the correct network (Base mainnet = 8453)
    if (chainId !== 8453) {
      console.error('Wrong network! Expected Base (8453), got:', chainId);
      setError(new Error('Please switch to Base mainnet'));
      return;
    }

    if (!publicClient || !totalMarkets || Number(totalMarkets) === 0) {
      console.log('No markets to fetch or public client not ready');
      setMarkets([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const totalMarketsCount = Number(totalMarkets);
      console.log(`Fetching ${totalMarketsCount} markets from contract...`);
      
      if (totalMarketsCount === 0) {
        setMarkets([]);
        setIsLoading(false);
        return;
      }

      // Get all market IDs using the new contract's getAllMarkets function
      const marketIds = await publicClient.readContract({
        address: MARKET_FACTORY_CONTRACT.address,
        abi: MARKET_FACTORY_CONTRACT.abi,
        functionName: 'getAllMarkets',
        args: [BigInt(0), BigInt(totalMarketsCount)] // offset: 0, limit: totalMarketsCount
      });

      console.log('Market IDs to fetch:', marketIds);

      // Fetch all markets in parallel
      const marketPromises = marketIds.map(async (marketId) => {
        try {
          console.log(`Fetching market ${marketId}...`);
          
          const [marketData, marketStats] = await publicClient.readContract({
            address: MARKET_FACTORY_CONTRACT.address,
            abi: MARKET_FACTORY_CONTRACT.abi,
            functionName: 'getMarket',
            args: [marketId]
          });
          
          console.log(`Market ${marketId} data:`, marketData);
          console.log(`Market ${marketId} stats:`, marketStats);
          
          // Check if market data is valid
          if (!marketData || !marketData.title || marketData.title === "") {
            console.log(`Market ${marketId} has empty data, skipping`);
            return null;
          }
          
          // Transform contract data to frontend format
          const now = Math.floor(Date.now() / 1000);
          const isActive = !marketData.isResolved && Number(marketData.endTime) > now;
          
          const transformedMarket = {
            id: Number(marketData.id),
            title: marketData.title,
            category: marketData.category,
            description: marketData.description,
            participants: Number(marketStats.totalPredictions) || 0,
            endDate: new Date(Number(marketData.endTime) * 1000).toLocaleDateString(),
            status: (() => {
              if (marketData.isResolved) return "ended";
              return isActive ? "active" : "ended";
            })(),
            marketType: "binary", // Contract only supports binary markets
            betAmountETH: formatETH(marketData.betAmountETH),
            settlementSource: marketData.settlementSource
          };
          
          console.log(`Transformed market ${marketId}:`, transformedMarket);
          return transformedMarket;
        } catch (error) {
          console.error(`Error fetching market ${marketId}:`, error);
          return null;
        }
      });

      const fetchedMarkets = await Promise.all(marketPromises);
      const validMarkets = fetchedMarkets.filter(market => market !== null);
      
      console.log('Fetched markets:', validMarkets);
      setMarkets(validMarkets);
    } catch (error) {
      console.error('Error fetching markets:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, chainId, totalMarkets]);

  // Fetch markets when totalMarkets changes
  useEffect(() => {
    if (totalMarkets !== undefined && publicClient) {
      fetchMarkets();
    }
  }, [totalMarkets, publicClient, fetchMarkets]);

  return {
    markets,
    isLoading: isLoading || isLoadingCount,
    error: error || totalMarketsError,
    refetch: fetchMarkets
  };
}