// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPredictionMarket {
    
    struct Market {
        uint256 id;
        string title;
        string description;
        string category;
        uint256 betAmountUSDC;
        uint256 betAmountETH;
        uint256 endTime;
        string settlementSource;
        address creator;
        uint256 totalPredictions;
        uint256 totalPoolUSDC;
        uint256 totalPoolETH;
        bool isResolved;
        uint256 winningOutcome; // 0=No, 1=Yes
    }
    
    struct Prediction {
        address predictor;
        uint256 marketId;
        uint256 outcome; // 0=No, 1=Yes
        uint256 betAmountUSDC;
        uint256 betAmountETH;
        uint256 timestamp;
        bool isClaimed;
    }
    
    // Events
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string title,
        string category,
        uint256 betAmountUSDC,
        uint256 betAmountETH,
        uint256 endTime
    );
    
    event PredictionMade(
        uint256 indexed marketId,
        address indexed predictor,
        uint256 outcome,
        uint256 betAmountUSDC,
        uint256 betAmountETH
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        uint256 winningOutcome
    );
    
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed winner,
        uint256 usdcAmount,
        uint256 ethAmount
    );
    
    // Functions
    function createMarket(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _betAmountUSDC,
        uint256 _betAmountETH,
        uint256 _endTime,
        string memory _settlementSource
    ) external returns (uint256);
    
    function makePrediction(uint256 _marketId, uint256 _outcome) external payable;
    
    function resolveMarket(uint256 _marketId, uint256 _winningOutcome) external;
    
    function claimWinnings(uint256 _marketId) external;
    
    function getMarket(uint256 _marketId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory category,
        uint256 betAmountUSDC,
        uint256 betAmountETH,
        uint256 endTime,
        bool isResolved
    );
    
    function getMarketStats(uint256 _marketId) external view returns (
        string memory settlementSource,
        address creator,
        uint256 totalPredictions,
        uint256 totalPoolUSDC,
        uint256 totalPoolETH,
        uint256 winningOutcome
    );
    
    function getMarketPredictionCount(uint256 _marketId) external view returns (uint256);
    
    function getMarketPrediction(uint256 _marketId, uint256 _index) external view returns (
        address predictor,
        uint256 outcome,
        uint256 betAmountUSDC,
        uint256 betAmountETH,
        uint256 timestamp,
        bool isClaimed
    );
    
    function hasUserPredictedOnMarket(uint256 _marketId, address _user) external view returns (bool);
    
    function getMarketBets(uint256 _marketId) external view returns (uint256 _yesBets, uint256 _noBets);
}
