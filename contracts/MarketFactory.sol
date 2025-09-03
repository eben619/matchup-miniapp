// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MarketFactory
 * @dev Factory contract for creating prediction markets
 * @notice This contract handles market creation and deployment of individual market contracts
 */
contract MarketFactory is ReentrancyGuard, Ownable {
    
    // ============ STRUCTS ============
    
    struct MarketInfo {
        uint256 id;
        string title;
        string description;
        string category;
        uint256 betAmountETH;
        uint256 endTime;
        string settlementSource;
        address creator;
        address marketContract;
        bool isActive;
        uint256 createdAt;
    }
    
    // ============ STATE VARIABLES ============
    
    uint256 public nextMarketId = 1;
    uint256 public platformFeePercent = 250; // 2.5% (250 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    // Mappings
    mapping(uint256 => MarketInfo) public markets;
    mapping(address => uint256[]) public userMarkets; // creator => market IDs
    
    // ============ EVENTS ============
    
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string title,
        string category,
        uint256 betAmountETH,
        uint256 endTime,
        address marketContract
    );
    
    event MarketDeactivated(uint256 indexed marketId);
    event PlatformFeeUpdated(uint256 newFeePercent);
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        // No additional setup needed
    }
    
    // ============ MARKET CREATION ============
    
    /**
     * @dev Create a new prediction market
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
        
        // Deploy new PredictionMarket contract
        PredictionMarket newMarket = new PredictionMarket(
            marketId,
            _title,
            _description,
            _category,
            _betAmountETH,
            _endTime,
            _settlementSource,
            msg.sender,
            address(this) // Factory as owner
        );
        
        // Store market info
        markets[marketId] = MarketInfo({
            id: marketId,
            title: _title,
            description: _description,
            category: _category,
            betAmountETH: _betAmountETH,
            endTime: _endTime,
            settlementSource: _settlementSource,
            creator: msg.sender,
            marketContract: address(newMarket),
            isActive: true,
            createdAt: block.timestamp
        });
        
        // Track user's markets
        userMarkets[msg.sender].push(marketId);
        
        emit MarketCreated(
            marketId,
            msg.sender,
            _title,
            _category,
            _betAmountETH,
            _endTime,
            address(newMarket)
        );
        
        return marketId;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get market information
     * @param _marketId ID of the market
     */
    function getMarket(uint256 _marketId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory category,
        uint256 betAmountETH,
        uint256 endTime,
        string memory settlementSource,
        address creator,
        address marketContract,
        bool isActive,
        uint256 createdAt
    ) {
        MarketInfo memory market = markets[_marketId];
        return (
            market.id,
            market.title,
            market.description,
            market.category,
            market.betAmountETH,
            market.endTime,
            market.settlementSource,
            market.creator,
            market.marketContract,
            market.isActive,
            market.createdAt
        );
    }
    
    /**
     * @dev Get markets created by a user
     * @param _user User address
     */
    function getUserMarkets(address _user) external view returns (uint256[] memory) {
        return userMarkets[_user];
    }
    
    /**
     * @dev Get total number of markets
     */
    function getTotalMarkets() external view returns (uint256) {
        return nextMarketId - 1;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Deactivate a market (only owner)
     * @param _marketId ID of the market to deactivate
     */
    function deactivateMarket(uint256 _marketId) external onlyOwner {
        require(markets[_marketId].id != 0, "Market does not exist");
        markets[_marketId].isActive = false;
        emit MarketDeactivated(_marketId);
    }
    
    /**
     * @dev Update platform fee percentage (only owner)
     * @param _feePercent New fee percentage in basis points
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercent = _feePercent;
        emit PlatformFeeUpdated(_feePercent);
    }
    
    /**
     * @dev Withdraw collected fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {
        // Allow contract to receive ETH for fee collection
    }
}

/**
 * @title PredictionMarket
 * @dev Individual prediction market contract
 * @notice This contract handles predictions for a single market
 */
contract PredictionMarket is ReentrancyGuard, Ownable {
    
    // ============ STRUCTS ============
    
    struct Prediction {
        address predictor;
        uint256 outcome;          // 0=No, 1=Yes
        uint256 betAmountETH;
        uint256 timestamp;
        bool isClaimed;
    }
    
    // ============ STATE VARIABLES ============
    
    uint256 public immutable marketId;
    string public immutable title;
    string public immutable description;
    string public immutable category;
    uint256 public immutable betAmountETH;
    uint256 public immutable endTime;
    string public immutable settlementSource;
    address public immutable creator;
    
    bool public isResolved = false;
    uint256 public winningOutcome = 0; // 0=No, 1=Yes
    
    uint256 public totalPredictions = 0;
    uint256 public totalPoolETH = 0;
    
    // Mappings
    Prediction[] public predictions;
    mapping(address => bool) public hasUserPredicted;
    mapping(uint256 => uint256) public outcomeCounts; // outcome => count
    
    // ============ EVENTS ============
    
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
    
    constructor(
        uint256 _marketId,
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _betAmountETH,
        uint256 _endTime,
        string memory _settlementSource,
        address _creator,
        address _factory
    ) Ownable(_factory) {
        marketId = _marketId;
        title = _title;
        description = _description;
        category = _category;
        betAmountETH = _betAmountETH;
        endTime = _endTime;
        settlementSource = _settlementSource;
        creator = _creator;
    }
    
    // ============ PREDICTION FUNCTIONS ============
    
    /**
     * @dev Make a prediction on this market
     * @param _outcome 0 for No, 1 for Yes
     */
    function makePrediction(uint256 _outcome) external payable nonReentrant {
        require(!isResolved, "Market is resolved");
        require(block.timestamp < endTime, "Market has ended");
        require(_outcome == 0 || _outcome == 1, "Invalid outcome");
        require(msg.value == betAmountETH, "Incorrect bet amount");
        require(!hasUserPredicted[msg.sender], "User already predicted");
        
        // Create prediction
        predictions.push(Prediction({
            predictor: msg.sender,
            outcome: _outcome,
            betAmountETH: msg.value,
            timestamp: block.timestamp,
            isClaimed: false
        }));
        
        // Update state
        hasUserPredicted[msg.sender] = true;
        totalPredictions++;
        totalPoolETH += msg.value;
        outcomeCounts[_outcome]++;
        
        emit PredictionMade(marketId, msg.sender, _outcome, msg.value);
    }
    
    // ============ RESOLUTION FUNCTIONS ============
    
    /**
     * @dev Resolve the market (only owner/factory)
     * @param _winningOutcome 0 for No, 1 for Yes
     */
    function resolveMarket(uint256 _winningOutcome) external onlyOwner {
        require(!isResolved, "Market already resolved");
        require(block.timestamp >= endTime, "Market has not ended yet");
        require(_winningOutcome == 0 || _winningOutcome == 1, "Invalid outcome");
        
        isResolved = true;
        winningOutcome = _winningOutcome;
        
        emit MarketResolved(marketId, _winningOutcome);
    }
    
    /**
     * @dev Claim winnings for a resolved market
     */
    function claimWinnings() external nonReentrant {
        require(isResolved, "Market not resolved");
        
        // Find user's winning prediction
        uint256 predictionIndex = _findWinningPrediction(msg.sender);
        require(predictionIndex != type(uint256).max, "No winning prediction");
        
        Prediction storage prediction = predictions[predictionIndex];
        require(!prediction.isClaimed, "Winnings already claimed");
        
        prediction.isClaimed = true;
        
        // Calculate winnings
        uint256 totalWinningBets = outcomeCounts[winningOutcome];
        require(totalWinningBets > 0, "No winning bets");
        
        uint256 userWinnings = (totalPoolETH * prediction.betAmountETH) / (totalWinningBets * betAmountETH);
        
        // Transfer winnings
        payable(msg.sender).transfer(userWinnings);
        
        emit WinningsClaimed(marketId, msg.sender, userWinnings);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get prediction count
     */
    function getPredictionCount() external view returns (uint256) {
        return predictions.length;
    }
    
    /**
     * @dev Get prediction by index
     * @param _index Index of the prediction
     */
    function getPrediction(uint256 _index) external view returns (
        address predictor,
        uint256 outcome,
        uint256 betAmountETH,
        uint256 timestamp,
        bool isClaimed
    ) {
        require(_index < predictions.length, "Invalid index");
        Prediction memory prediction = predictions[_index];
        return (
            prediction.predictor,
            prediction.outcome,
            prediction.betAmountETH,
            prediction.timestamp,
            prediction.isClaimed
        );
    }
    
    /**
     * @dev Get market stats
     */
    function getMarketStats() external view returns (
        uint256 _totalPredictions,
        uint256 _totalPoolETH,
        uint256 _yesCount,
        uint256 _noCount,
        bool _isResolved,
        uint256 _winningOutcome
    ) {
        return (
            totalPredictions,
            totalPoolETH,
            outcomeCounts[1],
            outcomeCounts[0],
            isResolved,
            winningOutcome
        );
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Find winning prediction for a user
     * @param _user User address
     * @return Index of winning prediction or max uint256 if not found
     */
    function _findWinningPrediction(address _user) internal view returns (uint256) {
        for (uint256 i = 0; i < predictions.length; i++) {
            Prediction memory prediction = predictions[i];
            if (prediction.predictor == _user && 
                prediction.outcome == winningOutcome && 
                !prediction.isClaimed) {
                return i;
            }
        }
        return type(uint256).max;
    }
    
    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {
        // Allow contract to receive ETH for predictions
    }
}
