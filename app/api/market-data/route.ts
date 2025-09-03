import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { MARKET_FACTORY_CONTRACT } from '../../../lib/contract';

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

export async function POST(request: NextRequest) {
  try {
    const { marketId } = await request.json();

    if (!marketId) {
      return NextResponse.json({ error: 'Market ID is required' }, { status: 400 });
    }

    // Fetch market data from the contract
    const marketResult = await publicClient.readContract({
      address: MARKET_FACTORY_CONTRACT.address,
      abi: MARKET_FACTORY_CONTRACT.abi,
      functionName: 'getMarket',
      args: [BigInt(marketId)]
    });

    // The new contract returns both market and stats in one call
    const [marketData, marketStats] = marketResult;

    // Transform the data to a more usable format
    const result = {
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
      tags: marketData.tags,
      totalPredictions: marketStats.totalPredictions,
      totalPoolETH: marketStats.totalPoolETH,
      yesBets: marketStats.yesBets,
      noBets: marketStats.noBets,
      uniquePredictors: marketStats.uniquePredictors
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
