import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { PREDICTION_MARKET_CONTRACT } from '../../../lib/contract';

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
    const [marketData, marketStats, marketBets] = await Promise.all([
      publicClient.readContract({
        address: PREDICTION_MARKET_CONTRACT.address,
        abi: PREDICTION_MARKET_CONTRACT.abi,
        functionName: 'getMarket',
        args: [BigInt(marketId)]
      }),
      publicClient.readContract({
        address: PREDICTION_MARKET_CONTRACT.address,
        abi: PREDICTION_MARKET_CONTRACT.abi,
        functionName: 'getMarketStats',
        args: [BigInt(marketId)]
      }),
      publicClient.readContract({
        address: PREDICTION_MARKET_CONTRACT.address,
        abi: PREDICTION_MARKET_CONTRACT.abi,
        functionName: 'getMarketBets',
        args: [BigInt(marketId)]
      })
    ]);

    // Transform the data to a more usable format
    const result = {
      id: marketData[0],
      title: marketData[1],
      description: marketData[2],
      category: marketData[3],
      betAmountUSDC: marketData[4],
      betAmountETH: marketData[5],
      endTime: marketData[6],
      isResolved: marketData[7],
      settlementSource: marketStats[0],
      creator: marketStats[1],
      totalPredictions: marketStats[2],
      totalPoolUSDC: marketStats[3],
      totalPoolETH: marketStats[4],
      winningOutcome: marketStats[5],
      yesBets: marketBets[0],
      noBets: marketBets[1]
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
