// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title TimeToken
 * @dev Soulbound token (ERC-5484) representing verified service hours in the Timebank system
 * @notice Non-transferable tokens that expire to encourage active participation
 */
contract TimeToken is ERC721, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;
    using Math for uint256;

    // ============ Roles ============
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ============ State Variables ============
    Counters.Counter private _tokenIdCounter;
    
    /// @notice Default token expiration time (180 days)
    uint256 public constant DEFAULT_EXPIRATION = 180 days;
    
    /// @notice Maximum expiration extension (365 days from original)
    uint256 public constant MAX_EXPIRATION_EXTENSION = 365 days;
    
    /// @notice Grace period after expiration before tokens become unusable (7 days)
    uint256 public constant GRACE_PERIOD = 7 days;

    // ============ Token Data ============
    struct TokenData {
        uint256 hoursEarned;        // Hours of service represented
        uint256 mintedAt;           // When token was minted
        uint256 expiresAt;          // When token expires
        string serviceCategory;     // Category of service (e.g., "teaching", "gardening")
        address serviceProvider;    // Who provided the service (token holder)
        address serviceRecipient;   // Who received the service
        string metadataURI;         // Additional metadata
        bool redeemed;              // Whether token has been used
    }

    /// @dev Mapping from token ID to token data
    mapping(uint256 => TokenData) public tokenData;
    
    /// @dev Total active hours in circulation (excluding expired/redeemed)
    uint256 public totalActiveHours;
    
    /// @dev Total hours ever minted
    uint256 public totalHoursMinted;
    
    /// @dev Total hours redeemed
    uint256 public totalHoursRedeemed;

    // ============ Events ============
    /// @notice Emitted when a new TimeToken is minted
    event TimeTokenMinted(
        uint256 indexed tokenId,
        indexed address indexed serviceProvider,
        address indexed serviceRecipient,
        uint256 hoursEarned,
        uint256 expiresAt,
        string serviceCategory
    );

    /// @notice Emitted when a TimeToken is redeemed/burned
    event TimeTokenRedeemed(
        uint256 indexed tokenId,
        indexed address indexed redeemer,
        uint256 hoursRedeemed,
        string redemptionPurpose
    );

    /// @notice Emitted when a TimeToken expires
    event TimeTokenExpired(
        uint256 indexed tokenId,
        uint256 expiredAt
    );

    /// @notice Emitted when token expiration is extended
    event ExpirationExtended(
        uint256 indexed tokenId,
        uint256 oldExpiration,
        uint256 newExpiration
    );

    /// @notice Emitted when oracle status is updated
    event OracleStatusChanged(
        indexed address indexed oracle,
        bool granted
    );

    // ============ Errors ============
    error TokenExpired(uint256 tokenId, uint256 expiredAt);
    error TokenAlreadyRedeemed(uint256 tokenId);
    error InvalidExpiration(uint256 provided, uint256 minimum);
    error UnauthorizedRedemption(address caller, uint256 tokenId);
    error TransferNotAllowed();
    error InvalidHours(uint256 hours_);
    error InvalidAddress();
    error TokenNotExpired(uint256 tokenId);

    // ============ Constructor ============
    constructor(
        string memory name,
        string memory symbol,
        address admin
    ) ERC721(name, symbol) {
        if (admin == address(0)) revert InvalidAddress();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        
        // Admin can grant oracle roles
        _setRoleAdmin(ORACLE_ROLE, ADMIN_ROLE);
    }

    // ============ External Functions ============

    /**
     * @notice Mint a new TimeToken for verified service completion
     * @dev Only callable by addresses with ORACLE_ROLE
     * @param serviceProvider Address that provided the service (receives token)
     * @param serviceRecipient Address that received the service
     * @param hoursEarned Number of hours earned
     * @param serviceCategory Category of service performed
     * @param metadataURI Additional metadata about the service
     * @param customExpiration Optional custom expiration (0 = use default)
     * @return tokenId The ID of the newly minted token
     */
    function mint(
        address serviceProvider,
        address serviceRecipient,
        uint256 hoursEarned,
        string calldata serviceCategory,
        string calldata metadataURI,
        uint256 customExpiration
    ) external onlyRole(ORACLE_ROLE) returns (uint256 tokenId) {
        if (serviceProvider == address(0)) revert InvalidAddress();
        if (hoursEarned == 0 || hoursEarned > 168) revert InvalidHours(hoursEarned); // Max 1 week per token

        tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        uint256 expiration = customExpiration > 0 
            ? customExpiration 
            : DEFAULT_EXPIRATION;
        
        uint256 expiryTimestamp = block.timestamp + expiration;

        tokenData[tokenId] = TokenData({
            hoursEarned: hoursEarned,
            mintedAt: block.timestamp,
            expiresAt: expiryTimestamp,
            serviceCategory: serviceCategory,
            serviceProvider: serviceProvider,
            serviceRecipient: serviceRecipient,
            metadataURI: metadataURI,
            redeemed: false
        });

        _safeMint(serviceProvider, tokenId);

        totalActiveHours += hoursEarned;
        totalHoursMinted += hoursEarned;

        emit TimeTokenMinted(
            tokenId,
            serviceProvider,
            serviceRecipient,
            hoursEarned,
            expiryTimestamp,
            serviceCategory
        );

        return tokenId;
    }

    /**
     * @notice Convenience mint function with default expiration
     */
    function mint(
        address serviceProvider,
        address serviceRecipient,
        uint256 hoursEarned,
        string calldata serviceCategory,
        string calldata metadataURI
    ) external onlyRole(ORACLE_ROLE) returns (uint256 tokenId) {
        return mint(
            serviceProvider,
            serviceRecipient,
            hoursEarned,
            serviceCategory,
            metadataURI,
            0
        );
    }

    /**
     * @notice Redeem/burn a TimeToken for services
     * @dev Token owner can redeem their own tokens
     * @param tokenId The token to redeem
     * @param redemptionPurpose Description of what the token is being redeemed for
     */
    function redeem(
        uint256 tokenId,
        string calldata redemptionPurpose
    ) external {
        address owner = ownerOf(tokenId);
        
        if (owner != msg.sender) revert UnauthorizedRedemption(msg.sender, tokenId);
        if (isExpired(tokenId)) revert TokenExpired(tokenId, tokenData[tokenId].expiresAt);
        if (tokenData[tokenId].redeemed) revert TokenAlreadyRedeemed(tokenId);

        TokenData storage data = tokenData[tokenId];
        data.redeemed = true;

        totalActiveHours -= data.hoursEarned;
        totalHoursRedeemed += data.hoursEarned;

        emit TimeTokenRedeemed(
            tokenId,
            msg.sender,
            data.hoursEarned,
            redemptionPurpose
        );

        _burn(tokenId);
    }

    /**
     * @notice Batch redeem multiple tokens
     * @param tokenIds Array of token IDs to redeem
     * @param redemptionPurpose Description of redemption
     */
    function redeemBatch(
        uint256[] calldata tokenIds,
        string calldata redemptionPurpose
    ) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            redeem(tokenIds[i], redemptionPurpose);
        }
    }

    /**
     * @notice Extend token expiration (oracle only)
     * @dev Can extend up to MAX_EXPIRATION_EXTENSION from original expiration
     * @param tokenId The token to extend
     * @param additionalTime Additional time to add
     */
    function extendExpiration(
        uint256 tokenId,
        uint256 additionalTime
    ) external onlyRole(ORACLE_ROLE) {
        TokenData storage data = tokenData[tokenId];
        
        uint256 oldExpiration = data.expiresAt;
        uint256 maxNewExpiration = data.mintedAt + DEFAULT_EXPIRATION + MAX_EXPIRATION_EXTENSION;
        uint256 requestedExpiration = oldExpiration + additionalTime;
        
        uint256 newExpiration = requestedExpiration > maxNewExpiration 
            ? maxNewExpiration 
            : requestedExpiration;

        data.expiresAt = newExpiration;

        emit ExpirationExtended(tokenId, oldExpiration, newExpiration);
    }

    /**
     * @notice Grant oracle role to an address
     * @param oracle Address to grant oracle role
     */
    function grantOracleRole(address oracle) external onlyRole(ADMIN_ROLE) {
        if (oracle == address(0)) revert InvalidAddress();
        _grantRole(ORACLE_ROLE, oracle);
        emit OracleStatusChanged(oracle, true);
    }

    /**
     * @notice Revoke oracle role from an address
     * @param oracle Address to revoke oracle role
     */
    function revokeOracleRole(address oracle) external onlyRole(ADMIN_ROLE) {
        _revokeRole(ORACLE_ROLE, oracle);
        emit OracleStatusChanged(oracle, false);
    }

    // ============ View Functions ============

    /**
     * @notice Get effective balance considering only non-expired, non-redeemed tokens
     * @param account The address to check
     * @return totalHours Total valid hours
     * @return tokenCount Number of valid tokens
     */
    function balanceOfEffective(address account) external view returns (
        uint256 totalHours,
        uint256 tokenCount
    ) {
        uint256 balance = balanceOf(account);
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(account, i);
            TokenData memory data = tokenData[tokenId];
            
            if (!data.redeemed && !isExpired(tokenId)) {
                totalHours += data.hoursEarned;
                tokenCount++;
            }
        }
        
        return (totalHours, tokenCount);
    }

    /**
     * @notice Get detailed balance breakdown for an account
     * @param account The address to check
     * @return activeHours Hours from active tokens
     * @return expiringSoonHours Hours from tokens expiring within 30 days
     * @return expiredHours Hours from expired tokens
     */
    function balanceOfDetailed(address account) external view returns (
        uint256 activeHours,
        uint256 expiringSoonHours,
        uint256 expiredHours
    ) {
        uint256 balance = balanceOf(account);
        uint256 thirtyDaysFromNow = block.timestamp + 30 days;
        
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(account, i);
            TokenData memory data = tokenData[tokenId];
            
            if (data.redeemed) continue;
            
            if (isExpired(tokenId)) {
                expiredHours += data.hoursEarned;
            } else if (data.expiresAt <= thirtyDaysFromNow) {
                expiringSoonHours += data.hoursEarned;
                activeHours += data.hoursEarned;
            } else {
                activeHours += data.hoursEarned;
            }
        }
        
        return (activeHours, expiringSoonHours, expiredHours);
    }

    /**
     * @notice Check if a token is expired
     * @param tokenId The token to check
     * @return True if expired
     */
    function isExpired(uint256 tokenId) public view returns (bool) {
        return block.timestamp > tokenData[tokenId].expiresAt;
    }

    /**
     * @notice Check if a token is within grace period
     * @param tokenId The token to check
     * @return True if in grace period
     */
    function isInGracePeriod(uint256 tokenId) external view returns (bool) {
        TokenData memory data = tokenData[tokenId];
        uint256 graceEnd = data.expiresAt + GRACE_PERIOD;
        return block.timestamp > data.expiresAt && block.timestamp <= graceEnd;
    }

    /**
     * @notice Get time remaining until expiration
     * @param tokenId The token to check
     * @return timeRemaining Seconds until expiration (0 if expired)
     */
    function timeUntilExpiration(uint256 tokenId) external view returns (uint256 timeRemaining) {
        TokenData memory data = tokenData[tokenId];
        if (block.timestamp >= data.expiresAt) return 0;
        return data.expiresAt - block.timestamp;
    }

    /**
     * @notice Get all token IDs owned by an address
     * @param owner The address to query
     * @return Array of token IDs
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokens;
    }

    /**
     * @notice Get full token data
     * @param tokenId The token ID
     * @return Complete token data struct
     */
    function getTokenData(uint256 tokenId) external view returns (TokenData memory) {
        return tokenData[tokenId];
    }

    // ============ Soulbound (ERC-5484) ============

    /**
     * @notice Returns the burn authorization level for a token
     * @dev ERC-5484 compliance: IssuerOnly = 1, OwnerOnly = 2, Both = 3, Neither = 4
     * @return 2 (OwnerOnly) - tokens can be burned by their owner when redeeming
     */
    function burnAuth(uint256) external pure returns (uint256) {
        return 2; // OwnerOnly
    }

    // ============ Internal Overrides ============

    /**
     * @dev Soulbound: Prevent all transfers except minting and burning
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Allow minting (from == 0) and burning (to == 0)
        if (from != address(0) && to != address(0)) {
            revert TransferNotAllowed();
        }
    }

    /**
     * @dev Override supportsInterface for AccessControl and ERC721Enumerable
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override _burn to clean up token data
     */
    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
        delete tokenData[tokenId];
    }
}
