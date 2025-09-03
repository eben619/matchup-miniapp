// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictionMarket
 * @dev Simple prediction market for binary Yes/No predictions (ETH only)
 */
contract PredictionMarket is ReentrancyGuard, Ownable {
    
    // ============ STRUCTS ============
    
    struct Market {
        uint256 id;
        string title;
        string description;
        string category;           // "sports", "crypto", "custom"
        uint256 betAmountETH;     // Fixed bet amount in ETH (with 18 decimals)
        uint256 endTime;          // Unix timestamp when market ends
        string settlementSource;  // URL for outcome verification
        address creator;
        uint256 totalPredictions;
        uint256 totalPoolETH;
        bool isResolved;
        uint256 winningOutcome;   // 0=No, 1=Yes
    }
    
    struct Prediction {
        address predictor;
        uint256 marketId;
        uint256 outcome;          // 0=No, 1=Yes
        uint256 betAmountETH;
        uint256 timestamp;
        bool isClaimed;
    }
    
    // ============ STATE VARIABLES ============
    
    uint256 public nextMarketId = 1;
    uint256 public platformFeePercent = 250; // 2.5% (250 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    // Mappings
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Prediction[]) public marketPredictions;
    mapping(uint256 => mapping(address => bool)) public hasUserPredicted; // marketId => user => has predicted
    mapping(uint256 => uint256) public yesBets; // marketId => total yes bets (in ETH)
    mapping(uint256 => uint256) public noBets;  // marketId => total no bets (in ETH)
    
    // Events
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string title,
        string category,
        uint256 betAmountETH,
        uint256 endTime
    );
    
    event PredictionMade(
        uint256 indexed marketId,
        address indexed predictor,
        uint256 outcome,
        uint256 betAmountETH
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        uint256 winningOutcome
    );
    
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed winner,
        uint256 ethAmount
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        // No USDC token needed - ETH only
    }
    
    // ============ MARKET CREATION ============
    
    /**
     * @dev Create a new binary prediction market
     * @param _title Market title
     * @param _description Market description
     * @param _category Market category ("sports", "crypto", "custom")
     * @param _betAmountETH Fixed bet amount in ETH (18 decimals)
     * @param _endTime Unix timestamp when market ends
     * @param _settlementSource URL for outcome verification
     */
    function createMarket(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _betAmountETH,
        uint256 _endTime,
        string memory _settlementSource
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_betAmountETH > 0, "ETH bet amount must be greater than 0");
        require(_endTime > block.timestamp, "End time must be in the future");
        require(bytes(_settlementSource).length > 0, "Settlement source cannot be empty");
        
        uint256 marketId = nextMarketId++;
        
        markets[marketId] = Market({
            id: marketId,
            title: _title,
            description: _description,
            category: _category,
            betAmountETH: _betAmountETH,
            endTime: _endTime,
            settlementSource: _settlementSource,
            creator: msg.sender,
            totalPredictions: 0,
            totalPoolETH: 0,
            isResolved: false,
            winningOutcome: 0
        });
        
        emit MarketCreated(
            marketId,
            msg.sender,
            _title,
            _category,
            _betAmountETH,
            _endTime
        );
        
        return marketId;
    }
    
    // ============ PREDICTION FUNCTIONS ============
    
    /**
     * @dev Make a prediction on a market (0=No, 1=Yes)
     * @param _marketId ID of the market
     * @param _outcome Prediction outcome (0=No, 1=Yes)
     */
    function makePrediction(uint256 _marketId, uint256 _outcome) 
        external 
        payable 
        nonReentrant 
    {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(!market.isResolved, "Market is resolved");
        require(block.timestamp < market.endTime, "Market has ended");
        require(!hasUserPredicted[_marketId][msg.sender], "User has already predicted");
        require(_outcome == 0 || _outcome == 1, "Invalid outcome");
        require(msg.value == market.betAmountETH, "Incorrect ETH amount");
        
        // Create prediction
        Prediction memory newPrediction = Prediction({
            predictor: msg.sender,
            marketId: _marketId,
            outcome: _outcome,
            betAmountETH: market.betAmountETH,
            timestamp: block.timestamp,
            isClaimed: false
        });
        
        marketPredictions[_marketId].push(newPrediction);
        hasUserPredicted[_marketId][msg.sender] = true;
        
        // Update market stats
        market.totalPredictions++;
        market.totalPoolETH += market.betAmountETH;
        
        // Update outcome stats
        if (_outcome == 1) {
            yesBets[_marketId] += market.betAmountETH;
        } else {
            noBets[_marketId] += market.betAmountETH;
        }
        
        emit PredictionMade(
            _marketId,
            msg.sender,
            _outcome,
            market.betAmountETH
        );
    }
    
    // ============ MARKET RESOLUTION ============
    
    /**
     * @dev Resolve a market with the winning outcome (0=No, 1=Yes)
     * @param _marketId ID of the market
     * @param _winningOutcome The winning outcome (0=No, 1=Yes)
     */
    function resolveMarket(uint256 _marketId, uint256 _winningOutcome) 
        external 
        onlyOwner 
    {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(block.timestamp >= market.endTime, "Market has not ended yet");
        require(!market.isResolved, "Market already resolved");
        require(_winningOutcome == 0 || _winningOutcome == 1, "Invalid outcome");
        
        market.isResolved = true;
        market.winningOutcome = _winningOutcome;
        
        emit MarketResolved(_marketId, _winningOutcome);
    }
    
    /**
     * @dev Claim winnings for a resolved market
     * @param _marketId ID of the market
     */
    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.id != 0, "Market does not exist");
        require(market.isResolved, "Market not resolved");

        // Find prediction index first (reduce stack depth)
        uint256 predictionIndex = _findWinningPrediction(_marketId, msg.sender);
        require(predictionIndex != type(uint256).max, "No winning prediction");

        Prediction storage prediction = marketPredictions[_marketId][predictionIndex];
        prediction.isClaimed = true;

        // Calculate and transfer winnings (split into separate functions if needed)
        _transferWinnings(_marketId, prediction, msg.sender);
    }

    /**
     * @dev Find winning prediction index for a user
     * @param _marketId ID of the market
     * @param _user User address
     * @return Index of winning prediction or type(uint256).max if not found
     */
    function _findWinningPrediction(uint256 _marketId, address _user)
        private
        view
        returns (uint256)
    {
        Market storage market = markets[_marketId];
        for (uint256 i = 0; i < marketPredictions[_marketId].length; i++) {
            Prediction storage p = marketPredictions[_marketId][i];
            if (p.predictor == _user && p.outcome == market.winningOutcome && !p.isClaimed) {
                return i;
            }
        }
        return type(uint256).max; // Not found
    }

    /**
     * @dev Transfer winnings to winner
     * @param _marketId ID of the market
     * @param _prediction The winning prediction
     * @param _winner Winner address
     */
    function _transferWinnings(uint256 _marketId, Prediction storage _prediction, address _winner)
        private
    {
        Market storage market = markets[_marketId];
        uint256 totalWinningBets = market.winningOutcome == 1 ? yesBets[_marketId] : noBets[_marketId];
        require(totalWinningBets > 0, "No winning bets");

        // Calculate and transfer ETH winnings
        uint256 userWinningsETH = (market.totalPoolETH * _prediction.betAmountETH) / totalWinningBets;
        uint256 netWinningsETH = userWinningsETH - (userWinningsETH * platformFeePercent) / BASIS_POINTS;
        payable(_winner).transfer(netWinningsETH);

        emit WinningsClaimed(_marketId, _winner, netWinningsETH);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get basic market info
     * @param _marketId ID of the market
     */
    function getMarket(uint256 _marketId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory category,
        uint256 betAmountETH,
        uint256 endTime,
        bool isResolved
    ) {
        Market storage market = markets[_marketId];
        return (
            market.id,
            market.title,
            market.description,
            market.category,
            market.betAmountETH,
            market.endTime,
            market.isResolved
        );
    }
    
    /**
     * @dev Get market stats
     * @param _marketId ID of the market
     */
    function getMarketStats(uint256 _marketId) external view returns (
        string memory settlementSource,
        address creator,
        uint256 totalPredictions,
        uint256 totalPoolETH,
        uint256 winningOutcome
    ) {
        Market storage market = markets[_marketId];
        return (
            market.settlementSource,
            market.creator,
            market.totalPredictions,
            market.totalPoolETH,
            market.winningOutcome
        );
    }
    
    /**
     * @dev Get prediction count for a market
     * @param _marketId ID of the market
     */
    function getMarketPredictionCount(uint256 _marketId) external view returns (uint256) {
        return marketPredictions[_marketId].length;
    }
    
    /**
     * @dev Get a specific prediction for a market
     * @param _marketId ID of the market
     * @param _index Index of the prediction
     */
    function getMarketPrediction(uint256 _marketId, uint256 _index) external view returns (
        address predictor,
        uint256 outcome,
        uint256 betAmountETH,
        uint256 timestamp,
        bool isClaimed
    ) {
        require(_index < marketPredictions[_marketId].length, "Index out of bounds");
        Prediction memory prediction = marketPredictions[_marketId][_index];
        return (
            prediction.predictor,
            prediction.outcome,
            prediction.betAmountETH,
            prediction.timestamp,
            prediction.isClaimed
        );
    }
    
    /**
     * @dev Check if user has predicted on a market
     * @param _marketId ID of the market
     * @param _user User address
     */
    function hasUserPredictedOnMarket(uint256 _marketId, address _user) external view returns (bool) {
        return hasUserPredicted[_marketId][_user];
    }
    
    /**
     * @dev Get bet amounts for a market (in ETH)
     * @param _marketId ID of the market
     */
    function getMarketBets(uint256 _marketId) external view returns (uint256 _yesBets, uint256 _noBets) {
        return (yesBets[_marketId], noBets[_marketId]);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set platform fee percentage
     * @param _feePercent Fee percentage in basis points (e.g., 250 = 2.5%)
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercent = _feePercent;
    }
    
    /**
     * @dev Withdraw platform fees (ETH only)
     */
    function withdrawFees() external onlyOwner {
        uint256 ethBalance = address(this).balance;
        
        if (ethBalance > 0) {
            payable(owner()).transfer(ethBalance);
        }
    }
    
    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {
        // Allow contract to receive ETH
    }
}
