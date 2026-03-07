// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TheInversionExcursion
 * @notice Main game contract for The Inversion Excursion mini app
 * @dev Coordinates all game mechanics: ScrollCards, Cells, Battles, and Trading
 */

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title IScrollCard
 * @notice Interface for ScrollCard NFT contract
 */
interface IScrollCard {
    struct ScrollAttributes {
        uint8 dungeon;
        uint8 tier;
        uint8 frequency;
        uint256 mintedAt;
        bool soulbound;
    }
    
    function mint(address to, uint8 dungeon, uint8 tier, uint8 frequency) external returns (uint256);
    function getAttributes(uint256 tokenId) external view returns (ScrollAttributes memory);
    function isSoulbound(uint256 tokenId) external view returns (bool);
    function unlockForTrading(uint256 tokenId) external;
    function lockAfterTrade(uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
}

/**
 * @title IVictoryMinter
 * @notice Interface for Victory NFT contract
 */
interface IVictoryMinter {
    function mintVictory(address to, uint256 cellId, uint8 dungeon, uint256 score) external returns (uint256);
}

/**
 * @title ICellRegistry
 * @notice Interface for Cell Registry contract
 */
interface ICellRegistry {
    struct Cell {
        uint256 id;
        address leader;
        address[] members;
        uint256 formedAt;
        uint256 battlesWon;
        uint256 battlesLost;
        bool active;
    }
    
    function createCell(address leader, address[] calldata members) external returns (uint256);
    function recordBattle(uint256 cellId, bool won, uint256 score) external;
    function getCell(uint256 cellId) external view returns (Cell memory);
}

/**
 * @title ITradingPost
 * @notice Interface for Trading Post contract
 */
interface ITradingPost {
    function giftBullet(address from, address to, uint256 scrollCardId, string calldata message) external;
}

/**
 * @title TheInversionExcursion
 * @author Inversion Collective
 * @notice Central game coordinator for The Inversion Excursion
 * @dev Upgradeable contract that manages game state and coordinates between modules
 */
contract TheInversionExcursion is 
    Initializable, 
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable 
{
    // ============ Roles ============
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // ============ State Variables ============
    IScrollCard public scrollCard;
    IVictoryMinter public victoryMinter;
    ICellRegistry public cellRegistry;
    ITradingPost public tradingPost;
    
    // Game parameters
    uint256 public entryFee;
    uint256 public maxCellSize;
    uint256 public battleCooldown;
    
    // Player state
    mapping(address => uint256) public playerCell;
    mapping(address => uint256) public lastBattleTime;
    mapping(address => uint256) public totalScore;
    
    // Dungeon state
    mapping(uint8 => bool) public dungeonActive;
    mapping(uint8 => uint256) public dungeonEntryCount;
    
    // ============ Events ============
    event ContractsSet(
        address scrollCard,
        address victoryMinter, 
        address cellRegistry,
        address tradingPost
    );
    
    event PlayerEnteredDungeon(
        address indexed player,
        uint8 indexed dungeon,
        uint256 timestamp
    );
    
    event BattleCompleted(
        address indexed player,
        uint256 indexed cellId,
        uint8 indexed dungeon,
        bool won,
        uint256 score,
        uint256 victoryTokenId
    );
    
    event CellFormed(
        uint256 indexed cellId,
        address indexed leader,
        address[] members
    );
    
    event BulletGiftSent(
        address indexed from,
        address indexed to,
        uint256 indexed scrollCardId,
        string message
    );
    
    event GameParamsUpdated(
        uint256 entryFee,
        uint256 maxCellSize,
        uint256 battleCooldown
    );
    
    event DungeonToggled(uint8 dungeon, bool active);
    
    // ============ Errors ============
    error InvalidContractAddress();
    error DungeonInactive(uint8 dungeon);
    error CellNotFound(uint256 cellId);
    error BattleOnCooldown(uint256 remaining);
    error CellFull(uint256 cellId);
    error NotCellLeader(address player, uint256 cellId);
    error InsufficientEntryFee(uint256 required, uint256 provided);
    
    // ============ Modifiers ============
    modifier onlyCellLeader(uint256 cellId) {
        ICellRegistry.Cell memory cell = cellRegistry.getCell(cellId);
        if (cell.leader != msg.sender) {
            revert NotCellLeader(msg.sender, cellId);
        }
        _;
    }
    
    modifier activeDungeon(uint8 dungeon) {
        if (!dungeonActive[dungeon]) {
            revert DungeonInactive(dungeon);
        }
        _;
    }
    
    // ============ Constructor & Initializer ============
    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        address admin,
        uint256 _entryFee,
        uint256 _maxCellSize,
        uint256 _battleCooldown
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GAME_MASTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        
        entryFee = _entryFee;
        maxCellSize = _maxCellSize;
        battleCooldown = _battleCooldown;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Set contract addresses for game modules
     * @param _scrollCard ScrollCard NFT contract address
     * @param _victoryMinter VictoryMinter contract address
     * @param _cellRegistry CellRegistry contract address
     * @param _tradingPost TradingPost contract address
     */
    function setContracts(
        address _scrollCard,
        address _victoryMinter,
        address _cellRegistry,
        address _tradingPost
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_scrollCard == address(0) || 
            _victoryMinter == address(0) || 
            _cellRegistry == address(0) || 
            _tradingPost == address(0)) {
            revert InvalidContractAddress();
        }
        
        scrollCard = IScrollCard(_scrollCard);
        victoryMinter = IVictoryMinter(_victoryMinter);
        cellRegistry = ICellRegistry(_cellRegistry);
        tradingPost = ITradingPost(_tradingPost);
        
        emit ContractsSet(_scrollCard, _victoryMinter, _cellRegistry, _tradingPost);
    }
    
    /**
     * @notice Update game parameters
     * @param _entryFee New entry fee amount
     * @param _maxCellSize New maximum cell size
     * @param _battleCooldown New battle cooldown period
     */
    function setGameParams(
        uint256 _entryFee,
        uint256 _maxCellSize,
        uint256 _battleCooldown
    ) external onlyRole(GAME_MASTER_ROLE) {
        entryFee = _entryFee;
        maxCellSize = _maxCellSize;
        battleCooldown = _battleCooldown;
        
        emit GameParamsUpdated(_entryFee, _maxCellSize, _battleCooldown);
    }
    
    /**
     * @notice Toggle dungeon active status
     * @param dungeon Dungeon ID
     * @param active New active status
     */
    function setDungeonStatus(uint8 dungeon, bool active) 
        external 
        onlyRole(GAME_MASTER_ROLE) 
    {
        dungeonActive[dungeon] = active;
        emit DungeonToggled(dungeon, active);
    }
    
    // ============ Game Functions ============
    
    /**
     * @notice Form a new cell with leader and members
     * @param members Array of member addresses (excluding leader)
     * @return cellId ID of the newly created cell
     */
    function formCell(address[] calldata members) 
        external 
        nonReentrant 
        returns (uint256 cellId) 
    {
        require(address(cellRegistry) != address(0), "Contracts not set");
        require(members.length < maxCellSize, "Cell too large");
        
        cellId = cellRegistry.createCell(msg.sender, members);
        playerCell[msg.sender] = cellId;
        
        for (uint256 i = 0; i < members.length; i++) {
            playerCell[members[i]] = cellId;
        }
        
        emit CellFormed(cellId, msg.sender, members);
    }
    
    /**
     * @notice Enter a dungeon for battle
     * @param dungeon Dungeon ID to enter
     * @param scrollCardId ScrollCard to use for entry
     */
    function enterDungeon(uint8 dungeon, uint256 scrollCardId) 
        external 
        payable
        activeDungeon(dungeon)
        nonReentrant 
    {
        require(address(scrollCard) != address(0), "Contracts not set");
        
        if (msg.value < entryFee) {
            revert InsufficientEntryFee(entryFee, msg.value);
        }
        
        // Verify scroll ownership
        require(scrollCard.ownerOf(scrollCardId) == msg.sender, "Not scroll owner");
        
        // Check cooldown
        uint256 timeSinceLastBattle = block.timestamp - lastBattleTime[msg.sender];
        if (timeSinceLastBattle < battleCooldown) {
            revert BattleOnCooldown(battleCooldown - timeSinceLastBattle);
        }
        
        dungeonEntryCount[dungeon]++;
        lastBattleTime[msg.sender] = block.timestamp;
        
        emit PlayerEnteredDungeon(msg.sender, dungeon, block.timestamp);
    }
    
    /**
     * @notice Complete a battle and mint victory NFT if won
     * @param player Player address
     * @param cellId Cell ID that participated
     * @param dungeon Dungeon ID
     * @param won Whether the battle was won
     * @param score Battle score
     * @return victoryTokenId ID of minted victory token (0 if lost)
     */
    function completeBattle(
        address player,
        uint256 cellId,
        uint8 dungeon,
        bool won,
        uint256 score
    ) external onlyRole(GAME_MASTER_ROLE) returns (uint256 victoryTokenId) {
        require(address(victoryMinter) != address(0), "Contracts not set");
        
        cellRegistry.recordBattle(cellId, won, score);
        totalScore[player] += score;
        
        if (won) {
            victoryTokenId = victoryMinter.mintVictory(player, cellId, dungeon, score);
        }
        
        emit BattleCompleted(player, cellId, dungeon, won, score, victoryTokenId);
    }
    
    /**
     * @notice Send a ScrollCard as a gift (Bullet Gift)
     * @param to Recipient address
     * @param scrollCardId ScrollCard to gift
     * @param message Gift message
     */
    function sendBulletGift(
        address to,
        uint256 scrollCardId,
        string calldata message
    ) external nonReentrant {
        require(address(tradingPost) != address(0), "Contracts not set");
        
        tradingPost.giftBullet(msg.sender, to, scrollCardId, message);
        
        emit BulletGiftSent(msg.sender, to, scrollCardId, message);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Check if player can battle
     * @param player Player address
     * @return canBattle Whether player can battle
     * @return cooldownRemaining Time until cooldown expires
     */
    function canBattle(address player) external view returns (bool, uint256) {
        uint256 timeSinceLastBattle = block.timestamp - lastBattleTime[player];
        if (timeSinceLastBattle >= battleCooldown) {
            return (true, 0);
        }
        return (false, battleCooldown - timeSinceLastBattle);
    }
    
    /**
     * @notice Get player statistics
     * @param player Player address
     * @return cellId Player's cell ID
     * @return score Player's total score
     * @return lastBattle Player's last battle timestamp
     */
    function getPlayerStats(address player) 
        external 
        view 
        returns (uint256 cellId, uint256 score, uint256 lastBattle) 
    {
        return (playerCell[player], totalScore[player], lastBattleTime[player]);
    }
    
    // ============ Upgrade Authorization ============
    
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
    
    // ============ Receive Function ============
    
    receive() external payable {}
}
