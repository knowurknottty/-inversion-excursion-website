# TimeToken Interface

## IERC5484 (Soulbound)

```solidity
interface IERC5484 {
    /// @notice Emitted when a soulbound token is minted
    event Issued(address indexed from, address indexed to, uint256 indexed tokenId, uint256 burnAuth);
    
    /// @notice Returns the burn authorization level for a token
    /// @dev 1 = IssuerOnly, 2 = OwnerOnly, 3 = Both, 4 = Neither
    function burnAuth(uint256 tokenId) external view returns (uint256);
}
```

## ITimeToken

```solidity
interface ITimeToken {
    // ============ Structs ============
    
    struct TokenData {
        uint256 hoursEarned;
        uint256 mintedAt;
        uint256 expiresAt;
        string serviceCategory;
        address serviceProvider;
        address serviceRecipient;
        string metadataURI;
        bool redeemed;
    }
    
    // ============ Roles ============
    
    function ORACLE_ROLE() external view returns (bytes32);
    function ADMIN_ROLE() external view returns (bytes32);
    
    // ============ Constants ============
    
    function DEFAULT_EXPIRATION() external view returns (uint256);
    function MAX_EXPIRATION_EXTENSION() external view returns (uint256);
    function GRACE_PERIOD() external view returns (uint256);
    
    // ============ State Variables ============
    
    function tokenData(uint256 tokenId) external view returns (TokenData memory);
    function totalActiveHours() external view returns (uint256);
    function totalHoursMinted() external view returns (uint256);
    function totalHoursRedeemed() external view returns (uint256);
    
    // ============ External Functions ============
    
    function mint(
        address serviceProvider,
        address serviceRecipient,
        uint256 hoursEarned,
        string calldata serviceCategory,
        string calldata metadataURI
    ) external returns (uint256 tokenId);
    
    function mint(
        address serviceProvider,
        address serviceRecipient,
        uint256 hoursEarned,
        string calldata serviceCategory,
        string calldata metadataURI,
        uint256 customExpiration
    ) external returns (uint256 tokenId);
    
    function redeem(uint256 tokenId, string calldata redemptionPurpose) external;
    
    function redeemBatch(
        uint256[] calldata tokenIds,
        string calldata redemptionPurpose
    ) external;
    
    function extendExpiration(uint256 tokenId, uint256 additionalTime) external;
    
    function grantOracleRole(address oracle) external;
    
    function revokeOracleRole(address oracle) external;
    
    // ============ View Functions ============
    
    function balanceOfEffective(address account) external view returns (
        uint256 totalHours,
        uint256 tokenCount
    );
    
    function balanceOfDetailed(address account) external view returns (
        uint256 activeHours,
        uint256 expiringSoonHours,
        uint256 expiredHours
    );
    
    function isExpired(uint256 tokenId) external view returns (bool);
    
    function isInGracePeriod(uint256 tokenId) external view returns (bool);
    
    function timeUntilExpiration(uint256 tokenId) external view returns (uint256);
    
    function getTokensByOwner(address owner) external view returns (uint256[] memory);
    
    function getTokenData(uint256 tokenId) external view returns (TokenData memory);
    
    function burnAuth(uint256 tokenId) external pure returns (uint256);
    
    // ============ Events ============
    
    event TimeTokenMinted(
        uint256 indexed tokenId,
        address indexed serviceProvider,
        address indexed serviceRecipient,
        uint256 hoursEarned,
        uint256 expiresAt,
        string serviceCategory
    );
    
    event TimeTokenRedeemed(
        uint256 indexed tokenId,
        address indexed redeemer,
        uint256 hoursRedeemed,
        string redemptionPurpose
    );
    
    event TimeTokenExpired(
        uint256 indexed tokenId,
        uint256 expiredAt
    );
    
    event ExpirationExtended(
        uint256 indexed tokenId,
        uint256 oldExpiration,
        uint256 newExpiration
    );
    
    event OracleStatusChanged(address indexed oracle, bool granted);
    
    // ============ Errors ============
    
    error TokenExpired(uint256 tokenId, uint256 expiredAt);
    error TokenAlreadyRedeemed(uint256 tokenId);
    error InvalidExpiration(uint256 provided, uint256 minimum);
    error UnauthorizedRedemption(address caller, uint256 tokenId);
    error TransferNotAllowed();
    error InvalidHours(uint256 hours_);
    error InvalidAddress();
    error TokenNotExpired(uint256 tokenId);
}
```
