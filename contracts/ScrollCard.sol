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
 * @title ScrollCard
 * @author Inversion Collective
 * @notice ERC-721 NFT representing dungeon scrolls with attributes
 * @dev Soulbound by default, transferable only through TradingPost
 * @custom:security-contact security@inversionexcursion.xyz
 */
contract ScrollCard is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    using Strings for uint8;

    // ============ Roles ============
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant TRADING_POST_ROLE = keccak256("TRADING_POST_ROLE");
    bytes32 public constant METADATA_MANAGER_ROLE = keccak256("METADATA_MANAGER_ROLE");

    // ============ Enums ============
    enum Frequency {
        COMMON,      // 0 - 60% chance
        UNCOMMON,    // 1 - 25% chance
        RARE,        // 2 - 10% chance
        EPIC,        // 3 - 4% chance
        LEGENDARY,   // 4 - 1% chance
        MYTHIC       // 5 - 0.1% chance (special events only)
    }

    enum Tier {
        NOVICE,      // 0 - Entry level
        ADEPT,       // 1 - Basic dungeons
        VETERAN,     // 2 - Intermediate
        ELITE,       // 3 - Advanced
        MASTER,      // 4 - Expert
        TRANSCENDENT // 5 - Special achievement
    }

    // ============ Structs ============
    
    /**
     * @notice Scroll card attributes
     * @param dungeon Dungeon ID (1-255)
     * @param tier Power tier (0-5)
     * @param frequency Rarity frequency (0-5)
     * @param mintedAt Block timestamp of minting
     * @param soulbound Whether the token is currently soulbound
     * @param dungeonName Human-readable dungeon name
     * @param powerScore Calculated power score
     */
    struct ScrollAttributes {
        uint8 dungeon;
        Tier tier;
        Frequency frequency;
        uint256 mintedAt;
        bool soulbound;
        string dungeonName;
        uint256 powerScore;
    }

    // ============ State Variables ============
    Counters.Counter private _tokenIdCounter;
    
    /// @notice Base URI for token metadata
    string private _baseTokenURI;
    
    /// @notice Contract-level metadata for OpenSea
    string public contractURI;

    /// @notice Mapping from token ID to attributes
    mapping(uint256 => ScrollAttributes) private _attributes;
    
    /// @notice Mapping from dungeon ID to name
    mapping(uint8 => string) public dungeonNames;
    
    /// @notice Mapping from dungeon+tier+freq hash to mint count (for scarcity)
    mapping(bytes32 => uint256) public mintCountByCombination;
    
    /// @notice Maximum supply per dungeon
    mapping(uint8 => uint256) public maxSupplyPerDungeon;
    
    /// @notice Current supply per dungeon
    mapping(uint8 => uint256) public supplyPerDungeon;
    
    /// @notice Zora Coins contract address for integration
    address public zoraCoinsContract;
    
    /// @notice Whether on-chain SVG generation is enabled
    bool public onChainSVGEnabled;

    // ============ Constants ============
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_DUNGEON_SUPPLY = 1000;
    
    /// @notice Farcaster Frame metadata version
    string public constant FARDCASTER_FRAME_VERSION = "vNext";
    
    /// @notice Power multipliers for tier calculation
    uint256[6] public TIER_MULTIPLIERS = [100, 250, 500, 1000, 2500, 10000];
    
    /// @notice Power multipliers for frequency calculation
    uint256[6] public FREQUENCY_MULTIPLIERS = [10, 25, 50, 100, 250, 1000];

    // ============ Events ============
    
    /**
     * @notice Emitted when a new ScrollCard is minted
     * @param tokenId Minted token ID
     * @param to Recipient address
     * @param dungeon Dungeon ID
     * @param tier Power tier
     * @param frequency Rarity frequency
     * @param powerScore Calculated power score
     */
    event ScrollMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint8 indexed dungeon,
        Tier tier,
        Frequency frequency,
        uint256 powerScore
    );
    
    /**
     * @notice Emitted when a ScrollCard's soulbound status changes
     * @param tokenId Token ID
     * @param soulbound New soulbound status
     * @param triggeredBy Address that triggered the change
     */
    event SoulboundStatusChanged(
        uint256 indexed tokenId,
        bool soulbound,
        address indexed triggeredBy
    );
    
    /**
     * @notice Emitted when dungeon name is updated
     * @param dungeon Dungeon ID
     * @param name New dungeon name
     */
    event DungeonNameSet(uint8 indexed dungeon, string name);
    
    /**
     * @notice Emitted when base URI is updated
     * @param newURI New base URI
     */
    event BaseURIUpdated(string newURI);
    
    /**
     * @notice Emitted when Zora Coins contract is set
     * @param zoraCoinsContract Address of Zora Coins contract
     */
    event ZoraCoinsContractSet(address indexed zoraCoinsContract);

    // ============ Errors ============
    error SoulboundToken(uint256 tokenId);
    error InvalidDungeon(uint8 dungeon);
    error InvalidTier(uint8 tier);
    error InvalidFrequency(uint8 frequency);
    error MaxSupplyReached(uint8 dungeon);
    error GlobalMaxSupplyReached();
    error NotTokenOwner(address caller, uint256 tokenId);
    error TokenDoesNotExist(uint256 tokenId);
    error InvalidAddress();
    error DungeonNameEmpty();

    // ============ Constructor ============
    
    /**
     * @notice Initialize the ScrollCard contract
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
        
        // Set default dungeon names
        dungeonNames[1] = "The Crypt of Whispers";
        dungeonNames[2] = "Abyssal Foundry";
        dungeonNames[3] = "Neon Cathedral";
        dungeonNames[4] = "The Inverted Spire";
        dungeonNames[5] = "Null Sector";
    }

    // ============ Minting Functions ============
    
    /**
     * @notice Mint a new ScrollCard
     * @param to Recipient address
     * @param dungeon Dungeon ID (1-255)
     * @param tier Power tier (0-5)
     * @param frequency Rarity frequency (0-5)
     * @return tokenId ID of the newly minted token
     * @dev Only callable by addresses with MINTER_ROLE
     */
    function mint(
        address to,
        uint8 dungeon,
        uint8 tier,
        uint8 frequency
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        if (to == address(0)) revert InvalidAddress();
        if (dungeon == 0) revert InvalidDungeon(dungeon);
        if (tier > uint8(Tier.TRANSCENDENT)) revert InvalidTier(tier);
        if (frequency > uint8(Frequency.MYTHIC)) revert InvalidFrequency(frequency);
        
        // Check supply limits
        if (_tokenIdCounter.current() >= MAX_SUPPLY) revert GlobalMaxSupplyReached();
        if (supplyPerDungeon[dungeon] >= MAX_DUNGEON_SUPPLY) revert MaxSupplyReached(dungeon);
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        supplyPerDungeon[dungeon]++;
        
        // Calculate power score
        uint256 powerScore = _calculatePowerScore(tier, frequency);
        
        // Get dungeon name
        string memory dungeonName = dungeonNames[dungeon];
        if (bytes(dungeonName).length == 0) {
            dungeonName = string(abi.encodePacked("Dungeon #", dungeon.toString()));
        }
        
        // Store attributes
        _attributes[tokenId] = ScrollAttributes({
            dungeon: dungeon,
            tier: Tier(tier),
            frequency: Frequency(frequency),
            mintedAt: block.timestamp,
            soulbound: true, // Soulbound by default
            dungeonName: dungeonName,
            powerScore: powerScore
        });
        
        // Track mint count for this combination
        bytes32 comboHash = keccak256(abi.encodePacked(dungeon, tier, frequency));
        mintCountByCombination[comboHash]++;
        
        _safeMint(to, tokenId);
        
        emit ScrollMinted(
            tokenId,
            to,
            dungeon,
            Tier(tier),
            Frequency(frequency),
            powerScore
        );
        
        return tokenId;
    }
    
    /**
     * @notice Batch mint ScrollCards
     * @param recipients Array of recipient addresses
     * @param dungeons Array of dungeon IDs
     * @param tiers Array of power tiers
     * @param frequencies Array of rarity frequencies
     * @return tokenIds Array of minted token IDs
     * @dev Only callable by addresses with MINTER_ROLE
     */
    function batchMint(
        address[] calldata recipients,
        uint8[] calldata dungeons,
        uint8[] calldata tiers,
        uint8[] calldata frequencies
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256[] memory) {
        require(
            recipients.length == dungeons.length &&
            dungeons.length == tiers.length &&
            tiers.length == frequencies.length,
            "Array length mismatch"
        );
        
        uint256[] memory tokenIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = this.mint(recipients[i], dungeons[i], tiers[i], frequencies[i]);
        }
        
        return tokenIds;
    }

    // ============ Soulbound Functions ============
    
    /**
     * @notice Unlock a token for trading (remove soulbound)
     * @param tokenId Token ID to unlock
     * @dev Only callable by TRADING_POST_ROLE
     */
    function unlockForTrading(uint256 tokenId) external onlyRole(TRADING_POST_ROLE) {
        if (!_exists(tokenId)) revert TokenDoesNotExist(tokenId);
        
        _attributes[tokenId].soulbound = false;
        
        emit SoulboundStatusChanged(tokenId, false, msg.sender);
    }
    
    /**
     * @notice Lock a token after trading (restore soulbound)
     * @param tokenId Token ID to lock
     * @dev Only callable by TRADING_POST_ROLE
     */
    function lockAfterTrade(uint256 tokenId) external onlyRole(TRADING_POST_ROLE) {
        if (!_exists(tokenId)) revert TokenDoesNotExist(tokenId);
        
        _attributes[tokenId].soulbound = true;
        
        emit SoulboundStatusChanged(tokenId, true, msg.sender);
    }
    
    /**
     * @notice Check if a token is soulbound
     * @param tokenId Token ID to check
     * @return True if token is soulbound
     */
    function isSoulbound(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) revert TokenDoesNotExist(tokenId);
        return _attributes[tokenId].soulbound;
    }

    // ============ Transfer Overrides ============
    
    /**
     * @notice Override transfer to enforce soulbound logic
     * @dev Only allows transfers if token is not soulbound or caller has TRADING_POST_ROLE
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from != address(0) && to != address(0)) {
            // Check if soulbound
            if (_attributes[tokenId].soulbound) {
                // Only TradingPost can transfer soulbound tokens
                if (!hasRole(TRADING_POST_ROLE, msg.sender)) {
                    revert SoulboundToken(tokenId);
                }
            }
        }
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
        
        // If on-chain SVG is enabled, return data URI
        if (onChainSVGEnabled) {
            return _generateOnChainMetadata(tokenId);
        }
        
        // Otherwise use base URI
        return super.tokenURI(tokenId);
    }
    
    /**
     * @notice Generate on-chain metadata and SVG
     * @param tokenId Token ID
     * @return dataUri Data URI containing full metadata
     */
    function _generateOnChainMetadata(uint256 tokenId) 
        internal 
        view 
        returns (string memory) 
    {
        ScrollAttributes memory attrs = _attributes[tokenId];
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{',
            '"name": "', attrs.dungeonName, ' Scroll #' , tokenId.toString(), '",',
            '"description": "A mystical scroll granting access to the ', attrs.dungeonName, '",',
            '"image": "', _generateSVG(tokenId, attrs), '",',
            '"attributes": [',
                '{"trait_type": "Dungeon", "value": "', attrs.dungeonName, '"},',
                '{"trait_type": "Tier", "value": "', _tierToString(attrs.tier), '", "display_type": "number"},',
                '{"trait_type": "Frequency", "value": "', _frequencyToString(attrs.frequency), '"},',
                '{"trait_type": "Power Score", "value": ', attrs.powerScore.toString(), ', "display_type": "number"},',
                '{"trait_type": "Soulbound", "value": "', attrs.soulbound ? "Yes" : "No", '"}',
            '],',
            '"frame": {',
                '"version": "', FARDCASTER_FRAME_VERSION, '",',
                '"title": "', attrs.dungeonName, ' Scroll",',
                '"image": "', _generateSVG(tokenId, attrs), '",',
                '"buttons": [',
                    '{"label": "View in Game", "action": "post_redirect", "target": "https://inversionexcursion.xyz/card/', tokenId.toString(), '"},',
                    '{"label": "Gift to Friend", "action": "post", "target": "https://inversionexcursion.xyz/gift/', tokenId.toString(), '"}',
                ']',
            '}',
            '}'
        ))));
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
    
    /**
     * @notice Generate SVG for a token
     * @param tokenId Token ID
     * @param attrs Scroll attributes
     * @return svgUri Data URI containing SVG
     */
    function _generateSVG(uint256 tokenId, ScrollAttributes memory attrs) 
        internal 
        pure 
        returns (string memory) 
    {
        // Generate color based on tier
        string memory primaryColor = _getTierColor(attrs.tier);
        string memory secondaryColor = _getFrequencyColor(attrs.frequency);
        
        string memory svg = Base64.encode(bytes(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">',
            '<defs>',
                '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                    '<stop offset="0%" style="stop-color:', primaryColor, '"/>',
                    '<stop offset="100%" style="stop-color:', secondaryColor, '"/>',
                '</linearGradient>',
                '<filter id="glow">',
                    '<feGaussianBlur stdDeviation="3" result="coloredBlur"/>',
                    '<feMerge>',
                        '<feMergeNode in="coloredBlur"/>',
                        '<feMergeNode in="SourceGraphic"/>',
                    '</feMerge>',
                '</filter>',
            '</defs>',
            '<rect width="400" height="600" fill="url(#bg)"/>',
            '<rect x="20" y="20" width="360" height="560" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>',
            '<text x="200" y="80" text-anchor="middle" font-family="serif" font-size="24" fill="white" filter="url(#glow)">',
                attrs.dungeonName,
            '</text>',
            '<text x="200" y="140" text-anchor="middle" font-family="monospace" font-size="14" fill="rgba(255,255,255,0.8)">',
                'SCROLL #', tokenId.toString(),
            '</text>',
            '<circle cx="200" cy="280" r="80" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>',
            '<text x="200" y="290" text-anchor="middle" font-family="serif" font-size="48" fill="white" filter="url(#glow)">',
                _tierToSymbol(attrs.tier),
            '</text>',
            '<text x="200" y="420" text-anchor="middle" font-family="monospace" font-size="16" fill="white">',
                'TIER: ', _tierToString(attrs.tier),
            '</text>',
            '<text x="200" y="450" text-anchor="middle" font-family="monospace" font-size="16" fill="white">',
                'FREQUENCY: ', _frequencyToString(attrs.frequency),
            '</text>',
            '<text x="200" y="480" text-anchor="middle" font-family="monospace" font-size="14" fill="rgba(255,255,255,0.7)">',
                'POWER: ', attrs.powerScore.toString(),
            '</text>',
            attrs.soulbound ? 
                '<text x="200" y="540" text-anchor="middle" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.5)">SOULBOUND</text>' 
                : '',
            '</svg>'
        )));
        
        return string(abi.encodePacked("data:image/svg+xml;base64,", svg));
    }

    // ============ View Functions ============
    
    /**
     * @notice Get scroll attributes
     * @param tokenId Token ID
     * @return Scroll attributes struct
     */
    function getAttributes(uint256 tokenId) 
        external 
        view 
        returns (ScrollAttributes memory) 
    {
        if (!_exists(tokenId)) revert TokenDoesNotExist(tokenId);
        return _attributes[tokenId];
    }
    
    /**
     * @notice Get tokens owned by an address
     * @param owner Owner address
     * @return Array of token IDs
     */
    function getTokensByOwner(address owner) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokens;
    }
    
    /**
     * @notice Check if a specific attribute combination exists
     * @param dungeon Dungeon ID
     * @param tier Power tier
     * @param frequency Rarity frequency
     * @return count Number of tokens with this combination
     */
    function getCombinationCount(
        uint8 dungeon,
        uint8 tier,
        uint8 frequency
    ) external view returns (uint256) {
        bytes32 comboHash = keccak256(abi.encodePacked(dungeon, tier, frequency));
        return mintCountByCombination[comboHash];
    }
    
    /**
     * @notice Calculate power score for a combination
     * @param tier Power tier
     * @param frequency Rarity frequency
     * @return powerScore Calculated power score
     */
    function calculatePowerScore(uint8 tier, uint8 frequency) 
        external 
        pure 
        returns (uint256) 
    {
        return _calculatePowerScore(tier, frequency);
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
     * @notice Set dungeon name
     * @param dungeon Dungeon ID
     * @param name Dungeon name
     */
    function setDungeonName(uint8 dungeon, string calldata name) 
        external 
        onlyRole(METADATA_MANAGER_ROLE) 
    {
        if (dungeon == 0) revert InvalidDungeon(dungeon);
        if (bytes(name).length == 0) revert DungeonNameEmpty();
        
        dungeonNames[dungeon] = name;
        emit DungeonNameSet(dungeon, name);
    }
    
    /**
     * @notice Set Zora Coins contract address
     * @param _zoraCoinsContract Zora Coins contract address
     */
    function setZoraCoinsContract(address _zoraCoinsContract) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        zoraCoinsContract = _zoraCoinsContract;
        emit ZoraCoinsContractSet(_zoraCoinsContract);
    }
    
    /**
     * @notice Toggle on-chain SVG generation
     * @param enabled Whether to enable on-chain SVG
     */
    function setOnChainSVGEnabled(bool enabled) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        onChainSVGEnabled = enabled;
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
    
    /**
     * @notice Grant trading post role to an address
     * @param tradingPost Address to grant role
     */
    function setTradingPost(address tradingPost) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _grantRole(TRADING_POST_ROLE, tradingPost);
    }
    
    /**
     * @notice Revoke trading post role from an address
     * @param tradingPost Address to revoke role
     */
    function removeTradingPost(address tradingPost) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _revokeRole(TRADING_POST_ROLE, tradingPost);
    }

    // ============ Internal Functions ============
    
    function _calculatePowerScore(uint8 tier, uint8 frequency) 
        internal 
        pure 
        returns (uint256) 
    {
        return TIER_MULTIPLIERS[tier] * FREQUENCY_MULTIPLIERS[frequency];
    }
    
    function _tierToString(Tier tier) internal pure returns (string memory) {
        if (tier == Tier.NOVICE) return "Novice";
        if (tier == Tier.ADEPT) return "Adept";
        if (tier == Tier.VETERAN) return "Veteran";
        if (tier == Tier.ELITE) return "Elite";
        if (tier == Tier.MASTER) return "Master";
        return "Transcendent";
    }
    
    function _frequencyToString(Frequency frequency) internal pure returns (string memory) {
        if (frequency == Frequency.COMMON) return "Common";
        if (frequency == Frequency.UNCOMMON) return "Uncommon";
        if (frequency == Frequency.RARE) return "Rare";
        if (frequency == Frequency.EPIC) return "Epic";
        if (frequency == Frequency.LEGENDARY) return "Legendary";
        return "Mythic";
    }
    
    function _tierToSymbol(Tier tier) internal pure returns (string memory) {
        if (tier == Tier.NOVICE) return unicode"☆";
        if (tier == Tier.ADEPT) return unicode"★";
        if (tier == Tier.VETERAN) return unicode"✦";
        if (tier == Tier.ELITE) return unicode"✶";
        if (tier == Tier.MASTER) return unicode"✹";
        return unicode"✸";
    }
    
    function _getTierColor(Tier tier) internal pure returns (string memory) {
        if (tier == Tier.NOVICE) return "#8B7355";
        if (tier == Tier.ADEPT) return "#4A90A4";
        if (tier == Tier.VETERAN) return "#8B4513";
        if (tier == Tier.ELITE) return "#800080";
        if (tier == Tier.MASTER) return "#FFD700";
        return "#FF4500";
    }
    
    function _getFrequencyColor(Frequency frequency) internal pure returns (string memory) {
        if (frequency == Frequency.COMMON) return "#C0C0C0";
        if (frequency == Frequency.UNCOMMON) return "#32CD32";
        if (frequency == Frequency.RARE) return "#4169E1";
        if (frequency == Frequency.EPIC) return "#9932CC";
        if (frequency == Frequency.LEGENDARY) return "#FF8C00";
        return "#FF1493";
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
    
    /**
     * @notice Burn a token (only admin)
     * @param tokenId Token to burn
     */
    function burn(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _burn(tokenId);
    }
}
