// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title VictoryMinter
 * @author Inversion Collective
 * @notice ERC-721 NFT contract for battle victories and achievements
 * @dev Soulbound achievement tokens that cannot be transferred
 * @custom:security-contact security@inversionexcursion.xyz
 */
contract VictoryMinter is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    using Strings for uint8;

    // ============ Roles ============
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant METADATA_MANAGER_ROLE = keccak256("METADATA_MANAGER_ROLE");

    // ============ Enums ============
    enum VictoryType {
        STANDARD,      // 0 - Regular dungeon clear
        PERFECT,       // 1 - No damage taken
        SPEEDRUN,      // 2 - Completed under time limit
        SURVIVAL,      // 3 - Solo completion
        COORDINATED,   // 4 - Full cell coordination bonus
        LEGENDARY      // 5 - Special achievement
    }

    enum AchievementTier {
        BRONZE,        // 0 - Basic achievement
        SILVER,        // 1 - Notable achievement
        GOLD,          // 2 - Major achievement
        PLATINUM,      // 3 - Exceptional achievement
        DIAMOND,       // 4 - Legendary achievement
        CELESTIAL      // 5 - One-time server-wide events
    }

    // ============ Structs ============
    
    /**
     * @notice Victory NFT attributes
     * @param cellId Cell that achieved the victory
     * @param dungeon Dungeon ID where victory occurred
     * @param victoryType Type of victory achieved
     * @param achievementTier Tier of achievement
     * @param score Battle score
     * @param timestamp Block timestamp of minting
     * @param metadataURI Optional external metadata URI
     */
    struct VictoryAttributes {
        uint256 cellId;
        uint8 dungeon;
        VictoryType victoryType;
        AchievementTier achievementTier;
        uint256 score;
        uint256 timestamp;
        string metadataURI;
    }
    
    /**
     * @notice Achievement definition
     * @param name Achievement name
     * @param description Achievement description
     * @param requiredScore Minimum score required
     * @param maxSupply Maximum supply (0 = unlimited)
     * @param currentSupply Current mint count
     * @param active Whether achievement is active
     */
    struct Achievement {
        string name;
        string description;
        uint256 requiredScore;
        uint256 maxSupply;
        uint256 currentSupply;
        bool active;
    }

    // ============ State Variables ============
    Counters.Counter private _tokenIdCounter;
    
    /// @notice Base URI for token metadata
    string private _baseTokenURI;
    
    /// @notice Contract-level metadata
    string public contractURI;
    
    /// @notice Mapping from token ID to victory attributes
    mapping(uint256 => VictoryAttributes) private _victoryAttributes;
    
    /// @notice Mapping from achievement ID to achievement definition
    mapping(uint256 => Achievement) public achievements;
    
    /// @notice Mapping from player to their victories
    mapping(address => uint256[]) private _playerVictories;
    
    /// @notice Mapping from cell to their victories
    mapping(uint256 => uint256[]) private _cellVictories;
    
    /// @notice Mapping from achievement ID to token IDs
    mapping(uint256 => uint256[]) private _achievementTokens;
    
    /// @notice Achievement ID counter
    uint256 public achievementCounter;
    
    /// @notice Total victories minted
    uint256 public totalVictories;
    
    /// @notice Maximum victories per player
    uint256 public constant MAX_VICTORIES_PER_PLAYER = 1000;

    // ============ Events ============
    
    /**
     * @notice Emitted when a victory NFT is minted
     * @param tokenId Minted token ID
     * @param to Recipient address
     * @param cellId Cell ID that achieved victory
     * @param dungeon Dungeon ID
     * @param victoryType Type of victory
     * @param achievementTier Achievement tier
     * @param score Battle score
     */
    event VictoryMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 indexed cellId,
        uint8 dungeon,
        VictoryType victoryType,
        AchievementTier achievementTier,
        uint256 score
    );
    
    /**
     * @notice Emitted when a new achievement is created
     * @param achievementId Achievement ID
     * @param name Achievement name
     * @param requiredScore Minimum score required
     * @param maxSupply Maximum supply
     */
    event AchievementCreated(
        uint256 indexed achievementId,
        string name,
        uint256 requiredScore,
        uint256 maxSupply
    );
    
    /**
     * @notice Emitted when achievement status changes
     * @param achievementId Achievement ID
     * @param active New active status
     */
    event AchievementToggled(uint256 indexed achievementId, bool active);
    
    /**
     * @notice Emitted when base URI is updated
     * @param newURI New base URI
     */
    event BaseURIUpdated(string newURI);

    // ============ Errors ============
    error SoulboundToken();
    error InvalidAchievement(uint256 achievementId);
    error AchievementInactive(uint256 achievementId);
    error AchievementMaxSupplyReached(uint256 achievementId);
    error MaxVictoriesReached(address player);
    error ScoreBelowThreshold(uint256 score, uint256 required);
    error TokenDoesNotExist(uint256 tokenId);
    error InvalidAddress();
    error AchievementNameEmpty();

    // ============ Constructor ============
    
    /**
     * @notice Initialize VictoryMinter contract
     * @param name Token collection name
     * @param symbol Token collection symbol
     * @param baseURI Initial base URI for metadata
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseURI;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(METADATA_MANAGER_ROLE, msg.sender);
        
        // Create default achievements
        _createDefaultAchievements();
    }

    // ============ Minting Functions ============
    
    /**
     * @notice Mint a victory NFT
     * @param to Recipient address
     * @param cellId Cell ID that achieved victory
     * @param dungeon Dungeon ID
     * @param score Battle score
     * @return tokenId ID of the newly minted token
     * @dev Only callable by addresses with MINTER_ROLE
     */
    function mintVictory(
        address to,
        uint256 cellId,
        uint8 dungeon,
        uint256 score
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        if (to == address(0)) revert InvalidAddress();
        if (_playerVictories[to].length >= MAX_VICTORIES_PER_PLAYER) {
            revert MaxVictoriesReached(to);
        }
        
        // Determine victory type and tier based on score
        (VictoryType vType, AchievementTier tier) = _calculateVictoryType(score);
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        totalVictories++;
        
        // Store victory attributes
        _victoryAttributes[tokenId] = VictoryAttributes({
            cellId: cellId,
            dungeon: dungeon,
            victoryType: vType,
            achievementTier: tier,
            score: score,
            timestamp: block.timestamp,
            metadataURI: ""
        });
        
        // Track player and cell victories
        _playerVictories[to].push(tokenId);
        _cellVictories[cellId].push(tokenId);
        
        _safeMint(to, tokenId);
        
        emit VictoryMinted(
            tokenId,
            to,
            cellId,
            dungeon,
            vType,
            tier,
            score
        );
        
        return tokenId;
    }
    
    /**
     * @notice Batch mint victory NFTs
     * @param recipients Array of recipient addresses
     * @param cellIds Array of cell IDs
     * @param dungeons Array of dungeon IDs
     * @param scores Array of battle scores
     * @return tokenIds Array of minted token IDs
     */
    function batchMintVictories(
        address[] calldata recipients,
        uint256[] calldata cellIds,
        uint8[] calldata dungeons,
        uint256[] calldata scores
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256[] memory) {
        require(
            recipients.length == cellIds.length &&
            cellIds.length == dungeons.length &&
            dungeons.length == scores.length,
            "Array length mismatch"
        );
        
        uint256[] memory tokenIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = this.mintVictory(recipients[i], cellIds[i], dungeons[i], scores[i]);
        }
        
        return tokenIds;
    }
    
    /**
     * @notice Mint a specific achievement
     * @param to Recipient address
     * @param cellId Cell ID
     * @param dungeon Dungeon ID
     * @param score Battle score
     * @param achievementId Specific achievement ID to mint
     * @return tokenId ID of the newly minted token
     */
    function mintAchievement(
        address to,
        uint256 cellId,
        uint8 dungeon,
        uint256 score,
        uint256 achievementId
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        Achievement storage achievement = achievements[achievementId];
        
        if (bytes(achievement.name).length == 0) revert InvalidAchievement(achievementId);
        if (!achievement.active) revert AchievementInactive(achievementId);
        if (achievement.maxSupply > 0 && achievement.currentSupply >= achievement.maxSupply) {
            revert AchievementMaxSupplyReached(achievementId);
        }
        if (score < achievement.requiredScore) {
            revert ScoreBelowThreshold(score, achievement.requiredScore);
        }
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        totalVictories++;
        achievement.currentSupply++;
        
        // Determine tier based on score ratio
        AchievementTier tier = _calculateTierFromScore(score, achievement.requiredScore);
        
        _victoryAttributes[tokenId] = VictoryAttributes({
            cellId: cellId,
            dungeon: dungeon,
            victoryType: VictoryType.LEGENDARY,
            achievementTier: tier,
            score: score,
            timestamp: block.timestamp,
            metadataURI: ""
        });
        
        _playerVictories[to].push(tokenId);
        _cellVictories[cellId].push(tokenId);
        _achievementTokens[achievementId].push(tokenId);
        
        _safeMint(to, tokenId);
        
        emit VictoryMinted(
            tokenId,
            to,
            cellId,
            dungeon,
            VictoryType.LEGENDARY,
            tier,
            score
        );
        
        return tokenId;
    }

    // ============ Soulbound Enforcement ============
    
    /**
     * @notice Override all transfer functions to make tokens soulbound
     * @dev Victory NFTs cannot be transferred - they are permanent achievements
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Only allow minting (from == address(0))
        // Prevent all transfers between addresses
        if (from != address(0) && to != address(0)) {
            revert SoulboundToken();
        }
    }
    
    /**
     * @notice Prevent approval of tokens
     */
    function approve(address to, uint256 tokenId) public pure override(ERC721, IERC721) {
        revert SoulboundToken();
    }
    
    /**
     * @notice Prevent approval for all
     */
    function setApprovalForAll(address operator, bool approved) public pure override(ERC721, IERC721) {
        revert SoulboundToken();
    }

    // ============ Achievement Management ============
    
    /**
     * @notice Create a new achievement
     * @param name Achievement name
     * @param description Achievement description
     * @param requiredScore Minimum score required
     * @param maxSupply Maximum supply (0 for unlimited)
     * @return achievementId ID of the newly created achievement
     */
    function createAchievement(
        string calldata name,
        string calldata description,
        uint256 requiredScore,
        uint256 maxSupply
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        if (bytes(name).length == 0) revert AchievementNameEmpty();
        
        uint256 achievementId = achievementCounter++;
        
        achievements[achievementId] = Achievement({
            name: name,
            description: description,
            requiredScore: requiredScore,
            maxSupply: maxSupply,
            currentSupply: 0,
            active: true
        });
        
        emit AchievementCreated(achievementId, name, requiredScore, maxSupply);
        
        return achievementId;
    }
    
    /**
     * @notice Toggle achievement active status
     * @param achievementId Achievement ID
     * @param active New active status
     */
    function setAchievementActive(
        uint256 achievementId, 
        bool active
    ) external onlyRole(MINTER_ROLE) {
        if (bytes(achievements[achievementId].name).length == 0) {
            revert InvalidAchievement(achievementId);
        }
        
        achievements[achievementId].active = active;
        emit AchievementToggled(achievementId, active);
    }

    // ============ Metadata Functions ============
    
    /**
     * @notice Get token URI with full metadata
     * @param tokenId Token ID
     * @return URI string containing metadata
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        if (!_exists(tokenId)) revert TokenDoesNotExist(tokenId);
        
        VictoryAttributes memory attrs = _victoryAttributes[tokenId];
        
        // Generate on-chain metadata
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{',
            '"name": "Victory #', tokenId.toString(), '",',
            '"description": "', _generateDescription(attrs), '",',
            '"image": "', _generateVictorySVG(tokenId, attrs), '",',
            '"attributes": [',
                '{"trait_type": "Dungeon", "value": "', attrs.dungeon.toString(), '"},',
                '{"trait_type": "Victory Type", "value": "', _victoryTypeToString(attrs.victoryType), '"},',
                '{"trait_type": "Achievement Tier", "value": "', _tierToString(attrs.achievementTier), '"},',
                '{"trait_type": "Score", "value": ', attrs.score.toString(), ', "display_type": "number"},',
                '{"trait_type": "Cell ID", "value": ', attrs.cellId.toString(), ', "display_type": "number"},',
                '{"trait_type": "Date", "display_type": "date", "value": ', attrs.timestamp.toString(), '}',
            ']',
            '}'
        ))));
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // ============ View Functions ============
    
    /**
     * @notice Get victory attributes
     * @param tokenId Token ID
     * @return Victory attributes struct
     */
    function getVictoryAttributes(uint256 tokenId) 
        external 
        view 
        returns (VictoryAttributes memory) 
    {
        if (!_exists(tokenId)) revert TokenDoesNotExist(tokenId);
        return _victoryAttributes[tokenId];
    }
    
    /**
     * @notice Get all victories for a player
     * @param player Player address
     * @return Array of token IDs
     */
    function getPlayerVictories(address player) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _playerVictories[player];
    }
    
    /**
     * @notice Get all victories for a cell
     * @param cellId Cell ID
     * @return Array of token IDs
     */
    function getCellVictories(uint256 cellId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _cellVictories[cellId];
    }
    
    /**
     * @notice Get victory count for a player
     * @param player Player address
     * @return Number of victories
     */
    function getPlayerVictoryCount(address player) external view returns (uint256) {
        return _playerVictories[player].length;
    }
    
    /**
     * @notice Get total score for a player across all victories
     * @param player Player address
     * @return Total score
     */
    function getPlayerTotalScore(address player) external view returns (uint256) {
        uint256 totalScore = 0;
        uint256[] memory victories = _playerVictories[player];
        
        for (uint256 i = 0; i < victories.length; i++) {
            totalScore += _victoryAttributes[victories[i]].score;
        }
        
        return totalScore;
    }
    
    /**
     * @notice Get victories by type for a player
     * @param player Player address
     * @param vType Victory type to filter
     * @return Array of token IDs matching the type
     */
    function getPlayerVictoriesByType(
        address player, 
        VictoryType vType
    ) external view returns (uint256[] memory) {
        uint256[] memory allVictories = _playerVictories[player];
        uint256[] memory temp = new uint256[](allVictories.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < allVictories.length; i++) {
            if (_victoryAttributes[allVictories[i]].victoryType == vType) {
                temp[count++] = allVictories[i];
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Set base URI for metadata
     * @param newBaseURI New base URI
     */
    function setBaseURI(string calldata newBaseURI) 
        external 
        onlyRole(METADATA_MANAGER_ROLE) 
    {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    /**
     * @notice Set contract URI for OpenSea collection metadata
     * @param _contractURI Contract metadata URI
     */
    function setContractURI(string calldata _contractURI) 
        external 
        onlyRole(METADATA_MANAGER_ROLE) 
    {
        contractURI = _contractURI;
    }

    // ============ Internal Functions ============
    
    function _calculateVictoryType(uint256 score) 
        internal 
        pure 
        returns (VictoryType, AchievementTier) 
    {
        if (score >= 10000) {
            return (VictoryType.LEGENDARY, AchievementTier.CELESTIAL);
        } else if (score >= 5000) {
            return (VictoryType.PERFECT, AchievementTier.DIAMOND);
        } else if (score >= 2500) {
            return (VictoryType.SPEEDRUN, AchievementTier.PLATINUM);
        } else if (score >= 1000) {
            return (VictoryType.COORDINATED, AchievementTier.GOLD);
        } else if (score >= 500) {
            return (VictoryType.SURVIVAL, AchievementTier.SILVER);
        } else {
            return (VictoryType.STANDARD, AchievementTier.BRONZE);
        }
    }
    
    function _calculateTierFromScore(uint256 score, uint256 requiredScore) 
        internal 
        pure 
        returns (AchievementTier) 
    {
        uint256 ratio = (score * 100) / requiredScore;
        
        if (ratio >= 500) return AchievementTier.CELESTIAL;
        if (ratio >= 300) return AchievementTier.DIAMOND;
        if (ratio >= 200) return AchievementTier.PLATINUM;
        if (ratio >= 150) return AchievementTier.GOLD;
        if (ratio >= 125) return AchievementTier.SILVER;
        return AchievementTier.BRONZE;
    }
    
    function _createDefaultAchievements() internal {
        // Create default achievements
        achievements[0] = Achievement({
            name: "First Blood",
            description: "Complete your first dungeon",
            requiredScore: 100,
            maxSupply: 0,
            currentSupply: 0,
            active: true
        });
        
        achievements[1] = Achievement({
            name: "Dungeon Master",
            description: "Complete all standard dungeons",
            requiredScore: 5000,
            maxSupply: 1000,
            currentSupply: 0,
            active: true
        });
        
        achievements[2] = Achievement({
            name: "Legendary Cell",
            description: "Achieve a perfect coordinated victory",
            requiredScore: 10000,
            maxSupply: 100,
            currentSupply: 0,
            active: true
        });
        
        achievementCounter = 3;
    }
    
    function _generateDescription(VictoryAttributes memory attrs) 
        internal 
        pure 
        returns (string memory) 
    {
        return string(abi.encodePacked(
            "A ",
            _tierToString(attrs.achievementTier),
            " victory achieved in Dungeon ",
            attrs.dungeon.toString(),
            " with a score of ",
            attrs.score.toString(),
            ". This ",
            _victoryTypeToString(attrs.victoryType),
            " victory is a permanent testament to skill and coordination."
        ));
    }
    
    function _generateVictorySVG(uint256 tokenId, VictoryAttributes memory attrs) 
        internal 
        pure 
        returns (string memory) 
    {
        string memory tierColor = _getTierColor(attrs.achievementTier);
        string memory typeSymbol = _getVictoryTypeSymbol(attrs.victoryType);
        
        string memory svg = Base64.encode(bytes(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">',
            '<defs>',
                '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                    '<stop offset="0%" style="stop-color:', tierColor, '"/>',
                    '<stop offset="100%" style="stop-color:#1a1a2e"/>',
                '</linearGradient>',
                '<filter id="glow">',
                    '<feGaussianBlur stdDeviation="4" result="coloredBlur"/>',
                    '<feMerge>',
                        '<feMergeNode in="coloredBlur"/>',
                        '<feMergeNode in="SourceGraphic"/>',
                    '</feMerge>',
                '</filter>',
            '</defs>',
            '<rect width="400" height="600" fill="url(#bg)"/>',
            '<rect x="20" y="20" width="360" height="560" fill="none" stroke="', tierColor, '" stroke-width="4"/>',
            '<text x="200" y="80" text-anchor="middle" font-family="serif" font-size="28" fill="white" filter="url(#glow)">',
                'VICTORY',
            '</text>',
            '<text x="200" y="280" text-anchor="middle" font-family="serif" font-size="120" fill="', tierColor, '" filter="url(#glow)">',
                typeSymbol,
            '</text>',
            '<text x="200" y="420" text-anchor="middle" font-family="monospace" font-size="18" fill="white">',
                _tierToString(attrs.achievementTier),
            '</text>',
            '<text x="200" y="460" text-anchor="middle" font-family="monospace" font-size="16" fill="rgba(255,255,255,0.8)">',
                'Score: ', attrs.score.toString(),
            '</text>',
            '<text x="200" y="490" text-anchor="middle" font-family="monospace" font-size="14" fill="rgba(255,255,255,0.6)">',
                'Dungeon ', attrs.dungeon.toString(),
            '</text>',
            '<text x="200" y="540" text-anchor="middle" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.4)">',
                '#', tokenId.toString(),
            '</text>',
            '</svg>'
        )));
        
        return string(abi.encodePacked("data:image/svg+xml;base64,", svg));
    }
    
    function _victoryTypeToString(VictoryType vType) internal pure returns (string memory) {
        if (vType == VictoryType.STANDARD) return "Standard";
        if (vType == VictoryType.PERFECT) return "Perfect";
        if (vType == VictoryType.SPEEDRUN) return "Speedrun";
        if (vType == VictoryType.SURVIVAL) return "Survival";
        if (vType == VictoryType.COORDINATED) return "Coordinated";
        return "Legendary";
    }
    
    function _tierToString(AchievementTier tier) internal pure returns (string memory) {
        if (tier == AchievementTier.BRONZE) return "Bronze";
        if (tier == AchievementTier.SILVER) return "Silver";
        if (tier == AchievementTier.GOLD) return "Gold";
        if (tier == AchievementTier.PLATINUM) return "Platinum";
        if (tier == AchievementTier.DIAMOND) return "Diamond";
        return "Celestial";
    }
    
    function _getVictoryTypeSymbol(VictoryType vType) internal pure returns (string memory) {
        if (vType == VictoryType.STANDARD) return unicode"⚔";
        if (vType == VictoryType.PERFECT) return unicode"★";
        if (vType == VictoryType.SPEEDRUN) return unicode"⚡";
        if (vType == VictoryType.SURVIVAL) return unicode"🛡";
        if (vType == VictoryType.COORDINATED) return unicode"✦";
        return unicode"👑";
    }
    
    function _getTierColor(AchievementTier tier) internal pure returns (string memory) {
        if (tier == AchievementTier.BRONZE) return "#CD7F32";
        if (tier == AchievementTier.SILVER) return "#C0C0C0";
        if (tier == AchievementTier.GOLD) return "#FFD700";
        if (tier == AchievementTier.PLATINUM) return "#E5E4E2";
        if (tier == AchievementTier.DIAMOND) return "#B9F2FF";
        return "#FF6B6B";
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // ============ Required Overrides ============
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
