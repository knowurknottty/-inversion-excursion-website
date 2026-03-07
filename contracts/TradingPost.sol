// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title IScrollCard
 * @notice Interface for ScrollCard NFT
 */
interface IScrollCard {
    function unlockForTrading(uint256 tokenId) external;
    function lockAfterTrade(uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
    function isSoulbound(uint256 tokenId) external view returns (bool);
}

/**
 * @title TradingPost
 * @author Inversion Collective
 * @notice One-way gifting system for ScrollCards - "Bullet Gifts"
 * @dev No marketplace functionality - only direct gifting
 * @custom:security-contact security@inversionexcursion.xyz
 */
contract TradingPost is AccessControl, ReentrancyGuard, Pausable, IERC721Receiver {
    using Counters for Counters.Counter;

    // ============ Roles ============
    bytes32 public constant TRADING_MANAGER_ROLE = keccak256("TRADING_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ============ Structs ============
    
    /**
     * @notice Gift record
     * @param id Gift ID
     * @param scrollCardId ScrollCard being gifted
     * @param from Sender address
     * @param to Recipient address
     * @param message Gift message
     * @param timestamp When gift was sent
     * @param claimed Whether gift has been claimed
     * @param refunded Whether gift was refunded
     */
    struct Gift {
        uint256 id;
        uint256 scrollCardId;
        address from;
        address to;
        string message;
        uint256 timestamp;
        bool claimed;
        bool refunded;
    }
    
    /**
     * @notice Trading limits for an address
     * @param dailyGiftsSent Number of gifts sent today
     * @param lastGiftReset Last reset timestamp
     * @param totalGiftsSent Total lifetime gifts sent
     * @param totalGiftsReceived Total lifetime gifts received
     */
    struct TradingStats {
        uint256 dailyGiftsSent;
        uint256 lastGiftReset;
        uint256 totalGiftsSent;
        uint256 totalGiftsReceived;
    }

    // ============ State Variables ============
    Counters.Counter private _giftIdCounter;
    
    /// @notice ScrollCard contract address
    IScrollCard public scrollCard;
    
    /// @notice Mapping from gift ID to Gift data
    mapping(uint256 => Gift) public gifts;
    
    /// @notice Mapping from gift ID to held token (escrow)
    mapping(uint256 => uint256) public giftEscrow;
    
    /// @notice Mapping from player to outgoing gift IDs
    mapping(address => uint256[]) private _outgoingGifts;
    
    /// @notice Mapping from player to incoming gift IDs
    mapping(address => uint256[]) private _incomingGifts;
    
    /// @notice Trading stats per address
    mapping(address => TradingStats) public tradingStats;
    
    /// @notice Maximum gifts per day per address
    uint256 public maxDailyGifts;
    
    /// @notice Claim period in seconds (default 7 days)
    uint256 public claimPeriod;
    
    /// @notice Whether gifting is enabled
    bool public giftingEnabled;
    
    /// @notice Whether refunds are enabled
    bool public refundsEnabled;
    
    /// @notice Fee for sending gifts (in wei)
    uint256 public giftFee;
    
    /// @notice Fee recipient address
    address public feeRecipient;
    
    /// @notice Total fees collected
    uint256 public totalFeesCollected;
    
    /// @notice Maximum message length
    uint256 public constant MAX_MESSAGE_LENGTH = 280;

    // ============ Events ============
    
    /**
     * @notice Emitted when a gift is sent
     * @param giftId Gift ID
     * @param scrollCardId ScrollCard being gifted
     * @param from Sender address
     * @param to Recipient address
     * @param message Gift message
     */
    event GiftSent(
        uint256 indexed giftId,
        uint256 indexed scrollCardId,
        address indexed from,
        address indexed to,
        string message
    );
    
    /**
     * @notice Emitted when a gift is claimed
     * @param giftId Gift ID
     * @param scrollCardId ScrollCard claimed
     * @param claimer Address that claimed
     */
    event GiftClaimed(
        uint256 indexed giftId,
        uint256 indexed scrollCardId,
        address indexed claimer
    );
    
    /**
     * @notice Emitted when a gift is refunded
     * @param giftId Gift ID
     * @param scrollCardId ScrollCard refunded
     * @param to Address refunded to
     */
    event GiftRefunded(
        uint256 indexed giftId,
        uint256 indexed scrollCardId,
        address indexed to
    );
    
    /**
     * @notice Emitted when daily limits are reset
     * @param player Player address
     * @param newResetTime New reset timestamp
     */
    event DailyLimitReset(address indexed player, uint256 newResetTime);
    
    /**
     * @notice Emitted when fees are withdrawn
     * @param recipient Fee recipient
     * @param amount Amount withdrawn
     */
    event FeesWithdrawn(address indexed recipient, uint256 amount);

    // ============ Errors ============
    error GiftingDisabled();
    error DailyLimitReached(address player, uint256 limit);
    error GiftDoesNotExist(uint256 giftId);
    error GiftAlreadyClaimed(uint256 giftId);
    error GiftAlreadyRefunded(uint256 giftId);
    error NotGiftRecipient(address caller, address expected);
    error NotGiftSender(address caller, address expected);
    error ClaimPeriodExpired(uint256 giftId);
    error ClaimPeriodNotExpired(uint256 giftId);
    error NotTokenOwner(address caller, uint256 tokenId);
    error InvalidAddress();
    error TransferFailed();
    error MessageTooLong(uint256 length, uint256 max);
    error CannotGiftToSelf();
    error TokenNotHeldInEscrow(uint256 giftId);

    // ============ Constructor ============
    
    /**
     * @notice Initialize TradingPost
     * @param admin Admin address
     * @param _scrollCard ScrollCard contract address
     * @param _maxDailyGifts Maximum gifts per day per address
     * @param _claimPeriod Claim period in seconds
     * @param _feeRecipient Fee recipient address
     */
    constructor(
        address admin,
        address _scrollCard,
        uint256 _maxDailyGifts,
        uint256 _claimPeriod,
        address _feeRecipient
    ) {
        if (_scrollCard == address(0) || _feeRecipient == address(0)) {
            revert InvalidAddress();
        }
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TRADING_MANAGER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        
        scrollCard = IScrollCard(_scrollCard);
        maxDailyGifts = _maxDailyGifts;
        claimPeriod = _claimPeriod;
        feeRecipient = _feeRecipient;
        giftingEnabled = true;
        refundsEnabled = true;
        
        _giftIdCounter.increment(); // Start at 1
    }

    // ============ Gift Functions ============
    
    /**
     * @notice Send a ScrollCard as a gift (Bullet Gift)
     * @param to Recipient address
     * @param scrollCardId ScrollCard to gift
     * @param message Gift message (max 280 chars)
     * @return giftId ID of the created gift
     */
    function sendBulletGift(
        address to,
        uint256 scrollCardId,
        string calldata message
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        if (!giftingEnabled) revert GiftingDisabled();
        if (to == address(0)) revert InvalidAddress();
        if (to == msg.sender) revert CannotGiftToSelf();
        if (bytes(message).length > MAX_MESSAGE_LENGTH) {
            revert MessageTooLong(bytes(message).length, MAX_MESSAGE_LENGTH);
        }
        if (msg.value < giftFee) {
            revert TransferFailed();
        }
        
        // Check and reset daily limits
        _checkAndResetDailyLimit(msg.sender);
        
        // Check daily limit
        TradingStats storage stats = tradingStats[msg.sender];
        if (stats.dailyGiftsSent >= maxDailyGifts) {
            revert DailyLimitReached(msg.sender, maxDailyGifts);
        }
        
        // Verify ownership
        if (scrollCard.ownerOf(scrollCardId) != msg.sender) {
            revert NotTokenOwner(msg.sender, scrollCardId);
        }
        
        // Create gift
        uint256 giftId = _giftIdCounter.current();
        _giftIdCounter.increment();
        
        gifts[giftId] = Gift({
            id: giftId,
            scrollCardId: scrollCardId,
            from: msg.sender,
            to: to,
            message: message,
            timestamp: block.timestamp,
            claimed: false,
            refunded: false
        });
        
        // Escrow token
        giftEscrow[giftId] = scrollCardId;
        
        // Unlock token for transfer (remove soulbound)
        scrollCard.unlockForTrading(scrollCardId);
        
        // Transfer to this contract (escrow)
        scrollCard.transferFrom(msg.sender, address(this), scrollCardId);
        
        // Lock token again (still soulbound, just held by TradingPost)
        scrollCard.lockAfterTrade(scrollCardId);
        
        // Update stats
        stats.dailyGiftsSent++;
        stats.totalGiftsSent++;
        tradingStats[to].totalGiftsReceived++;
        
        // Track gifts
        _outgoingGifts[msg.sender].push(giftId);
        _incomingGifts[to].push(giftId);
        
        // Collect fee
        if (msg.value > 0) {
            totalFeesCollected += msg.value;
        }
        
        emit GiftSent(giftId, scrollCardId, msg.sender, to, message);
        
        return giftId;
    }
    
    /**
     * @notice Claim a received gift
     * @param giftId Gift ID to claim
     */
    function claimGift(uint256 giftId) external nonReentrant whenNotPaused {
        Gift storage gift = gifts[giftId];
        
        if (gift.id == 0) revert GiftDoesNotExist(giftId);
        if (gift.claimed) revert GiftAlreadyClaimed(giftId);
        if (gift.refunded) revert GiftAlreadyRefunded(giftId);
        if (gift.to != msg.sender) revert NotGiftRecipient(msg.sender, gift.to);
        if (block.timestamp > gift.timestamp + claimPeriod) {
            revert ClaimPeriodExpired(giftId);
        }
        
        uint256 scrollCardId = giftEscrow[giftId];
        if (scrollCardId == 0) revert TokenNotHeldInEscrow(giftId);
        
        // Mark as claimed
        gift.claimed = true;
        
        // Unlock for transfer
        scrollCard.unlockForTrading(scrollCardId);
        
        // Transfer to recipient
        scrollCard.transferFrom(address(this), msg.sender, scrollCardId);
        
        // Lock again (soulbound to new owner)
        scrollCard.lockAfterTrade(scrollCardId);
        
        // Clear escrow
        delete giftEscrow[giftId];
        
        emit GiftClaimed(giftId, scrollCardId, msg.sender);
    }
    
    /**
     * @notice Refund an unclaimed gift after claim period
     * @param giftId Gift ID to refund
     */
    function refundGift(uint256 giftId) external nonReentrant whenNotPaused {
        if (!refundsEnabled) revert GiftingDisabled();
        
        Gift storage gift = gifts[giftId];
        
        if (gift.id == 0) revert GiftDoesNotExist(giftId);
        if (gift.claimed) revert GiftAlreadyClaimed(giftId);
        if (gift.refunded) revert GiftAlreadyRefunded(giftId);
        if (gift.from != msg.sender) revert NotGiftSender(msg.sender, gift.from);
        if (block.timestamp <= gift.timestamp + claimPeriod) {
            revert ClaimPeriodNotExpired(giftId);
        }
        
        uint256 scrollCardId = giftEscrow[giftId];
        if (scrollCardId == 0) revert TokenNotHeldInEscrow(giftId);
        
        // Mark as refunded
        gift.refunded = true;
        
        // Unlock for transfer
        scrollCard.unlockForTrading(scrollCardId);
        
        // Transfer back to sender
        scrollCard.transferFrom(address(this), msg.sender, scrollCardId);
        
        // Lock again (soulbound to original owner)
        scrollCard.lockAfterTrade(scrollCardId);
        
        // Clear escrow
        delete giftEscrow[giftId];
        
        emit GiftRefunded(giftId, scrollCardId, msg.sender);
    }
    
    /**
     * @notice External function for GameMaster to send gifts
     * @param from Sender address
     * @param to Recipient address
     * @param scrollCardId ScrollCard to gift
     * @param message Gift message
     * @dev Used by main game contract for system gifts
     */
    function giftBullet(
        address from,
        address to,
        uint256 scrollCardId,
        string calldata message
    ) external onlyRole(TRADING_MANAGER_ROLE) nonReentrant whenNotPaused {
        // Verify ownership
        if (scrollCard.ownerOf(scrollCardId) != from) {
            revert NotTokenOwner(from, scrollCardId);
        }
        
        uint256 giftId = _giftIdCounter.current();
        _giftIdCounter.increment();
        
        gifts[giftId] = Gift({
            id: giftId,
            scrollCardId: scrollCardId,
            from: from,
            to: to,
            message: message,
            timestamp: block.timestamp,
            claimed: false,
            refunded: false
        });
        
        giftEscrow[giftId] = scrollCardId;
        
        // Unlock and transfer
        scrollCard.unlockForTrading(scrollCardId);
        scrollCard.transferFrom(from, address(this), scrollCardId);
        scrollCard.lockAfterTrade(scrollCardId);
        
        _outgoingGifts[from].push(giftId);
        _incomingGifts[to].push(giftId);
        
        emit GiftSent(giftId, scrollCardId, from, to, message);
    }

    // ============ View Functions ============
    
    /**
     * @notice Get all outgoing gifts for an address
     * @param from Sender address
     * @return Array of gift IDs
     */
    function getOutgoingGifts(address from) external view returns (uint256[] memory) {
        return _outgoingGifts[from];
    }
    
    /**
     * @notice Get all incoming gifts for an address
     * @param to Recipient address
     * @return Array of gift IDs
     */
    function getIncomingGifts(address to) external view returns (uint256[] memory) {
        return _incomingGifts[to];
    }
    
    /**
     * @notice Get claimable gifts for an address
     * @param to Recipient address
     * @return Array of claimable gift IDs
     */
    function getClaimableGifts(address to) external view returns (uint256[] memory) {
        uint256[] memory incoming = _incomingGifts[to];
        uint256[] memory temp = new uint256[](incoming.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < incoming.length; i++) {
            Gift storage gift = gifts[incoming[i]];
            if (!gift.claimed && !gift.refunded && block.timestamp <= gift.timestamp + claimPeriod) {
                temp[count++] = incoming[i];
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }
    
    /**
     * @notice Get refundable gifts for an address
     * @param from Sender address
     * @return Array of refundable gift IDs
     */
    function getRefundableGifts(address from) external view returns (uint256[] memory) {
        uint256[] memory outgoing = _outgoingGifts[from];
        uint256[] memory temp = new uint256[](outgoing.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < outgoing.length; i++) {
            Gift storage gift = gifts[outgoing[i]];
            if (!gift.claimed && !gift.refunded && block.timestamp > gift.timestamp + claimPeriod) {
                temp[count++] = outgoing[i];
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }
    
    /**
     * @notice Get remaining daily gifts for an address
     * @param player Player address
     * @return remaining Number of remaining gifts today
     */
    function getRemainingDailyGifts(address player) external view returns (uint256) {
        TradingStats storage stats = tradingStats[player];
        
        // Check if day has reset
        if (block.timestamp >= stats.lastGiftReset + 1 days) {
            return maxDailyGifts;
        }
        
        return maxDailyGifts > stats.dailyGiftsSent ? maxDailyGifts - stats.dailyGiftsSent : 0;
    }
    
    /**
     * @notice Check if gift can be claimed
     * @param giftId Gift ID
     * @return canClaim Whether gift can be claimed
     * @return timeRemaining Time until claim expires (0 if expired)
     */
    function canClaim(uint256 giftId) external view returns (bool canClaim, uint256 timeRemaining) {
        Gift storage gift = gifts[giftId];
        
        if (gift.id == 0 || gift.claimed || gift.refunded) {
            return (false, 0);
        }
        
        uint256 expiry = gift.timestamp + claimPeriod;
        if (block.timestamp > expiry) {
            return (false, 0);
        }
        
        return (true, expiry - block.timestamp);
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Set ScrollCard contract address
     * @param _scrollCard New ScrollCard address
     */
    function setScrollCard(address _scrollCard) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_scrollCard == address(0)) revert InvalidAddress();
        scrollCard = IScrollCard(_scrollCard);
    }
    
    /**
     * @notice Set maximum daily gifts
     * @param _maxDailyGifts New maximum
     */
    function setMaxDailyGifts(uint256 _maxDailyGifts) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxDailyGifts = _maxDailyGifts;
    }
    
    /**
     * @notice Set claim period
     * @param _claimPeriod New claim period in seconds
     */
    function setClaimPeriod(uint256 _claimPeriod) external onlyRole(DEFAULT_ADMIN_ROLE) {
        claimPeriod = _claimPeriod;
    }
    
    /**
     * @notice Set gift fee
     * @param _giftFee New fee in wei
     */
    function setGiftFee(uint256 _giftFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        giftFee = _giftFee;
    }
    
    /**
     * @notice Set fee recipient
     * @param _feeRecipient New fee recipient
     */
    function setFeeRecipient(address _feeRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_feeRecipient == address(0)) revert InvalidAddress();
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @notice Toggle gifting
     * @param enabled Whether gifting is enabled
     */
    function setGiftingEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        giftingEnabled = enabled;
    }
    
    /**
     * @notice Toggle refunds
     * @param enabled Whether refunds are enabled
     */
    function setRefundsEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        refundsEnabled = enabled;
    }
    
    /**
     * @notice Withdraw collected fees
     */
    function withdrawFees() external nonReentrant {
        if (msg.sender != feeRecipient && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert NotGiftSender(msg.sender, feeRecipient);
        }
        
        uint256 amount = totalFeesCollected;
        totalFeesCollected = 0;
        
        (bool success, ) = feeRecipient.call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit FeesWithdrawn(feeRecipient, amount);
    }
    
    /**
     * @notice Pause contract
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ============ Internal Functions ============
    
    function _checkAndResetDailyLimit(address player) internal {
        TradingStats storage stats = tradingStats[player];
        
        if (block.timestamp >= stats.lastGiftReset + 1 days) {
            stats.dailyGiftsSent = 0;
            stats.lastGiftReset = block.timestamp;
            emit DailyLimitReset(player, block.timestamp);
        }
    }

    // ============ Required Interfaces ============
    
    /**
     * @notice IERC721Receiver implementation
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
    
    /**
     * @notice Receive function
     */
    receive() external payable {
        totalFeesCollected += msg.value;
    }
}
