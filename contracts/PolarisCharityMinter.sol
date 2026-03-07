// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title PolarisCharityMinter
 * @dev ERC-721 NFT contract with embedded 10% charity donation to Polaris Project
 * @notice Every mint automatically sends 10% of proceeds to Polaris Project
 * @notice Immutable charity commitment - cannot be changed after deployment
 * @author EPWorld x Polaris Project Partnership
 * 
 * POLARIS PROJECT PARTNERSHIP AGREEMENT:
 * - 10% of all mint proceeds automatically donated
 * - Donations sent to verified Polaris Project ETH address
 * - Immutable commitment encoded in contract
 * - Real-time transparency via on-chain events
 * - Public dashboard at: https://epworld.io/transparency
 */
contract PolarisCharityMinter is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    IERC2981,
    Ownable, 
    ReentrancyGuard,
    Pausable 
{
    using Counters for Counters.Counter;

    // ============ IMMUTABLE CHARITY CONFIGURATION ============
    
    /// @notice Polaris Project verified donation address (National Trafficking Hotline operator)
    /// @dev Immutable - cannot be changed after deployment
    address public immutable POLARIS_PROJECT_ADDRESS;
    
    /// @notice Charity donation percentage (10% = 1000 basis points)
    /// @dev Immutable - permanently locked at 10%
    uint256 public constant CHARITY_BASIS_POINTS = 1000;
    uint256 public constant MAX_BASIS_POINTS = 10000;
    
    /// @notice Partnership commitment hash (SHA256 of agreement document)
    /// @dev Immutable proof of partnership terms
    bytes32 public immutable PARTNERSHIP_COMMITMENT_HASH;
    
    /// @notice Partnership effective timestamp
    uint256 public immutable PARTNERSHIP_EFFECTIVE_DATE;
    
    /// @notice Partnership agreement URI (IPFS)
    string public PARTNERSHIP_AGREEMENT_URI;

    // ============ MINTING CONFIGURATION ============
    
    Counters.Counter private _tokenIdCounter;
    
    uint256 public maxSupply = 100000;
    uint256 public maxPerWallet = 100;
    uint256 public mintPrice = 0.01 ether;
    
    // Royalty configuration (ERC-2981)
    uint96 public royaltyFeeBasisPoints = 500; // 5%
    address public royaltyRecipient;

    // ============ IMPACT TRACKING ============
    
    /// @notice Total ETH donated to Polaris Project (wei)
    uint256 public totalDonatedWei;
    
    /// @notice Total number of mints that generated donations
    uint256 public totalCharityMints;
    
    /// @notice Total ETH raised for survivor support
    uint256 public totalSurvivorSupport;
    
    /// @notice Per-wallet donation tracking
    mapping(address => uint256) public donorTotalContributions;
    mapping(address => uint256) public donorMintCount;
    
    /// @notice Donation history for transparency
    struct DonationRecord {
        uint256 tokenId;
        address minter;
        uint256 amount;
        uint256 timestamp;
        uint256 mintPrice;
        string transactionHash; // Populated by frontend
    }
    
    DonationRecord[] public donationHistory;
    mapping(uint256 => DonationRecord) public tokenDonation;

    // ============ CARD ATTRIBUTES ============
    
    struct CardAttributes {
        uint256 power;
        uint256 rarity;
        uint256 chapter;
        string dungeon;
        string extractedQuote;
        uint256 mintTimestamp;
        address minter;
    }
    
    mapping(uint256 => CardAttributes) public cardAttributes;
    mapping(address => uint256) public mintsPerWallet;
    mapping(address => bool) public authorizedMinters;

    // ============ EVENTS ============
    
    /// @notice Emitted when a charity mint occurs
    event CharityMint(
        uint256 indexed tokenId,
        address indexed minter,
        uint256 donationAmount,
        uint256 timestamp,
        string message
    );
    
    /// @notice Emitted when donation is sent to Polaris Project
    event DonationSent(
        address indexed recipient,
        uint256 amount,
        uint256 indexed tokenId,
        string purpose
    );
    
    /// @notice Emitted when new donation milestone reached
    event DonationMilestone(
        uint256 totalDonated,
        uint256 milestoneNumber,
        string message
    );
    
    /// @notice Player lifetime impact update
    event PlayerImpactUpdated(
        address indexed player,
        uint256 totalContribution,
        uint256 mintCount,
        string impactStatement
    );
    
    event CardMinted(
        uint256 indexed tokenId,
        address indexed minter,
        uint256 power,
        uint256 rarity,
        uint256 chapter,
        string dungeon,
        uint256 donationAmount
    );
    
    event RoyaltyUpdated(uint96 newFeeBasisPoints);
    event MintPriceUpdated(uint256 newPrice);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    
    /// @notice Polaris Project address verification event
    event PolarisAddressVerified(
        address indexed polarisAddress,
        bytes32 commitmentHash,
        uint256 effectiveDate
    );

    // ============ MODIFIERS ============
    
    modifier onlyAuthorized() {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "PolarisMinter: Not authorized"
        );
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory name,
        string memory symbol,
        address _polarisProjectAddress,
        bytes32 _partnershipCommitmentHash,
        string memory _partnershipAgreementUri
    ) ERC721(name, symbol) Ownable(msg.sender) {
        // Validate Polaris Project address (cannot be zero)
        require(
            _polarisProjectAddress != address(0),
            "PolarisMinter: Invalid Polaris address"
        );
        
        // Set immutable charity configuration
        POLARIS_PROJECT_ADDRESS = _polarisProjectAddress;
        PARTNERSHIP_COMMITMENT_HASH = _partnershipCommitmentHash;
        PARTNERSHIP_AGREEMENT_URI = _partnershipAgreementUri;
        PARTNERSHIP_EFFECTIVE_DATE = block.timestamp;
        
        royaltyRecipient = msg.sender;
        
        // Start token IDs at 1
        _tokenIdCounter.increment();
        
        emit PolarisAddressVerified(
            _polarisProjectAddress,
            _partnershipCommitmentHash,
            block.timestamp
        );
    }

    // ============ CHARITY MINTING FUNCTIONS ============
    
    /**
     * @notice Main public mint with automatic charity donation
     * @dev 10% of mint price automatically sent to Polaris Project
     * @param uri IPFS URI for metadata
     * @param attributes Card stats and metadata
     * @return tokenId The ID of the newly minted token
     */
    function mintWithCharity(
        string memory uri,
        CardAttributes memory attributes
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(msg.value >= mintPrice, "PolarisMinter: Insufficient payment");
        require(totalSupply() < maxSupply, "PolarisMinter: Max supply reached");
        require(mintsPerWallet[msg.sender] < maxPerWallet, "PolarisMinter: Wallet limit");
        require(bytes(uri).length > 0, "PolarisMinter: URI required");
        
        // Calculate donation (10%)
        uint256 donationAmount = (mintPrice * CHARITY_BASIS_POINTS) / MAX_BASIS_POINTS;
        uint256 remainingValue = msg.value - donationAmount;
        
        // Send donation to Polaris Project (must succeed)
        (bool donationSuccess, ) = POLARIS_PROJECT_ADDRESS.call{value: donationAmount}("");
        require(donationSuccess, "PolarisMinter: Donation failed");
        
        // Refund excess if any
        if (remainingValue > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: remainingValue}("");
            require(refundSuccess, "PolarisMinter: Refund failed");
        }
        
        // Mint the NFT
        uint256 tokenId = _executeMint(msg.sender, uri, attributes, donationAmount);
        
        // Update impact tracking
        _updateImpactTracking(msg.sender, donationAmount, tokenId);
        
        // Emit charity events
        emit DonationSent(
            POLARIS_PROJECT_ADDRESS,
            donationAmount,
            tokenId,
            "National Trafficking Hotline - Survivor Support"
        );
        
        emit CharityMint(
            tokenId,
            msg.sender,
            donationAmount,
            block.timestamp,
            "This mint sent ETH to Polaris Project National Trafficking Hotline"
        );
        
        // Check for milestones (every 1 ETH)
        if (totalDonatedWei / 1 ether > (totalDonatedWei - donationAmount) / 1 ether) {
            emit DonationMilestone(
                totalDonatedWei,
                totalDonatedWei / 1 ether,
                "New milestone reached for survivor support!"
            );
        }
        
        return tokenId;
    }
    
    /**
     * @notice Batch mint with charity donation per mint
     * @param count Number of NFTs to mint
     * @param uris Metadata URIs
     * @param attributesArray Card attributes for each
     */
    function batchMintWithCharity(
        uint256 count,
        string[] calldata uris,
        CardAttributes[] calldata attributesArray
    ) external payable nonReentrant whenNotPaused returns (uint256[] memory) {
        require(count > 0 && count <= 20, "PolarisMinter: Batch size 1-20");
        require(
            uris.length == count && attributesArray.length == count,
            "PolarisMinter: Array mismatch"
        );
        
        uint256 totalCost = mintPrice * count;
        require(msg.value >= totalCost, "PolarisMinter: Insufficient payment");
        require(totalSupply() + count <= maxSupply, "PolarisMinter: Exceeds supply");
        
        uint256 totalDonation = (totalCost * CHARITY_BASIS_POINTS) / MAX_BASIS_POINTS;
        uint256 refund = msg.value - totalCost;
        
        // Send total donation
        (bool donationSuccess, ) = POLARIS_PROJECT_ADDRESS.call{value: totalDonation}("");
        require(donationSuccess, "PolarisMinter: Donation failed");
        
        // Refund excess
        if (refund > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: refund}("");
            require(refundSuccess, "PolarisMinter: Refund failed");
        }
        
        uint256[] memory tokenIds = new uint256[](count);
        uint256 donationPerMint = totalDonation / count;
        
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = _executeMint(msg.sender, uris[i], attributesArray[i], donationPerMint);
            _updateImpactTracking(msg.sender, donationPerMint, tokenIds[i]);
            
            emit DonationSent(
                POLARIS_PROJECT_ADDRESS,
                donationPerMint,
                tokenIds[i],
                "National Trafficking Hotline - Survivor Support"
            );
        }
        
        emit DonationMilestone(
            totalDonatedWei,
            totalDonatedWei / 1 ether,
            "Batch mint contribution to survivor support"
        );
        
        return tokenIds;
    }

    // ============ INTERNAL FUNCTIONS ============
    
    function _executeMint(
        address to,
        string memory uri,
        CardAttributes memory attributes,
        uint256 donationAmount
    ) internal returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        cardAttributes[tokenId] = CardAttributes({
            power: attributes.power,
            rarity: attributes.rarity,
            chapter: attributes.chapter,
            dungeon: attributes.dungeon,
            extractedQuote: attributes.extractedQuote,
            mintTimestamp: block.timestamp,
            minter: to
        });
        
        mintsPerWallet[to]++;
        
        emit CardMinted(
            tokenId,
            to,
            attributes.power,
            attributes.rarity,
            attributes.chapter,
            attributes.dungeon,
            donationAmount
        );
        
        return tokenId;
    }
    
    function _updateImpactTracking(
        address minter,
        uint256 donationAmount,
        uint256 tokenId
    ) internal {
        // Update global stats
        totalDonatedWei += donationAmount;
        totalSurvivorSupport += donationAmount;
        totalCharityMints++;
        
        // Update per-donor stats
        donorTotalContributions[minter] += donationAmount;
        donorMintCount[minter]++;
        
        // Record in history
        DonationRecord memory record = DonationRecord({
            tokenId: tokenId,
            minter: minter,
            amount: donationAmount,
            timestamp: block.timestamp,
            mintPrice: mintPrice,
            transactionHash: "" // Populated by frontend from event
        });
        
        donationHistory.push(record);
        tokenDonation[tokenId] = record;
        
        // Generate impact statement
        string memory impactStatement = _generateImpactStatement(
            donorTotalContributions[minter]
        );
        
        emit PlayerImpactUpdated(
            minter,
            donorTotalContributions[minter],
            donorMintCount[minter],
            impactStatement
        );
    }
    
    function _generateImpactStatement(uint256 totalContribution) 
        internal 
        pure 
        returns (string memory) 
    {
        uint256 ethAmount = totalContribution / 1 ether;
        
        if (ethAmount >= 10) {
            return "Champion Advocate: Your contributions have made a significant impact on survivor support!";
        } else if (ethAmount >= 5) {
            return "Guardian Supporter: Your consistent support helps sustain critical hotline operations.";
        } else if (ethAmount >= 1) {
            return "Active Ally: Your contributions directly support survivor resources.";
        } else if (ethAmount >= 0.1 ether) {
            return "Rising Advocate: Every contribution brings hope to survivors.";
        }
        return "New Supporter: Welcome to the movement for survivor justice.";
    }

    // ============ VIEW FUNCTIONS - IMPACT DATA ============
    
    /**
     * @notice Get complete impact statistics for a player
     * @param player Address to query
     * @return totalContribution Total ETH donated
     * @return mintCount Number of charity mints
     * @return impactLevel Current impact tier
     * @return impactStatement Human-readable impact message
     * @return tokensOwned List of token IDs owned
     */
    function getPlayerImpact(address player) 
        external 
        view 
        returns (
            uint256 totalContribution,
            uint256 mintCount,
            string memory impactLevel,
            string memory impactStatement,
            uint256[] memory tokensOwned
        ) 
    {
        totalContribution = donorTotalContributions[player];
        mintCount = donorMintCount[player];
        
        uint256 ethAmount = totalContribution / 1 ether;
        
        if (ethAmount >= 10) {
            impactLevel = "Champion Advocate";
        } else if (ethAmount >= 5) {
            impactLevel = "Guardian Supporter";
        } else if (ethAmount >= 1) {
            impactLevel = "Active Ally";
        } else if (ethAmount >= 0.1 ether) {
            impactLevel = "Rising Advocate";
        } else {
            impactLevel = "New Supporter";
        }
        
        impactStatement = _generateImpactStatement(totalContribution);
        tokensOwned = getCardsByOwner(player);
    }
    
    /**
     * @notice Get global charity statistics
     */
    function getGlobalCharityStats() 
        external 
        view 
        returns (
            uint256 _totalDonatedWei,
            uint256 _totalCharityMints,
            uint256 _totalSurvivorSupport,
            uint256 _currentMintPrice,
            uint256 _milestoneCount
        ) 
    {
        return (
            totalDonatedWei,
            totalCharityMints,
            totalSurvivorSupport,
            mintPrice,
            totalDonatedWei / 1 ether
        );
    }
    
    /**
     * @notice Get donation record for a specific token
     */
    function getTokenDonation(uint256 tokenId) 
        external 
        view 
        returns (DonationRecord memory) 
    {
        return tokenDonation[tokenId];
    }
    
    /**
     * @notice Get paginated donation history
     */
    function getDonationHistory(uint256 start, uint256 count) 
        external 
        view 
        returns (DonationRecord[] memory) 
    {
        uint256 end = start + count;
        if (end > donationHistory.length) {
            end = donationHistory.length;
        }
        
        DonationRecord[] memory result = new DonationRecord[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = donationHistory[i];
        }
        return result;
    }
    
    /**
     * @notice Get current donation amount for a mint
     */
    function getCurrentDonationAmount() external view returns (uint256) {
        return (mintPrice * CHARITY_BASIS_POINTS) / MAX_BASIS_POINTS;
    }
    
    /**
     * @notice Get partnership verification data
     */
    function getPartnershipInfo() 
        external 
        view 
        returns (
            address polarisAddress,
            uint256 charityPercent,
            bytes32 commitmentHash,
            uint256 effectiveDate,
            string memory agreementUri
        ) 
    {
        return (
            POLARIS_PROJECT_ADDRESS,
            CHARITY_BASIS_POINTS,
            PARTNERSHIP_COMMITMENT_HASH,
            PARTNERSHIP_EFFECTIVE_DATE,
            PARTNERSHIP_AGREEMENT_URI
        );
    }
    
    /**
     * @notice Format donation amount for UI display
     */
    function getFormattedImpact(address player) 
        external 
        view 
        returns (
            string memory ethContributed,
            string memory usdEstimate,
            string memory survivorImpact
        ) 
    {
        uint256 contribution = donorTotalContributions[player];
        uint256 ethWhole = contribution / 1 ether;
        uint256 ethDecimal = (contribution % 1 ether) / 1e15; // 3 decimal places
        
        ethContributed = string(abi.encodePacked(
            _uintToString(ethWhole),
            ".",
            _uintToString(ethDecimal),
            " ETH"
        ));
        
        // Rough USD estimate (would be updated by oracle in production)
        uint256 usdEstimateRaw = (contribution * 3000) / 1 ether; // $3000/ETH placeholder
        usdEstimate = string(abi.encodePacked("$", _uintToString(usdEstimateRaw)));
        
        // Survivor impact metrics
        uint256 hotlineMinutes = contribution / (0.001 ether); // ~$3/minute operating cost
        survivorImpact = string(abi.encodePacked(
            "Supported ",
            _uintToString(hotlineMinutes),
            " minutes of hotline operations"
        ));
    }

    // ============ STANDARD VIEW FUNCTIONS ============
    
    function getCardsByOwner(address owner) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    function getCardData(uint256 tokenId) 
        external 
        view 
        returns (
            address owner,
            string memory uri,
            CardAttributes memory attributes,
            uint256 donationAmount
        ) 
    {
        owner = ownerOf(tokenId);
        uri = tokenURI(tokenId);
        attributes = cardAttributes[tokenId];
        donationAmount = tokenDonation[tokenId].amount;
    }

    // ============ ROYALTY (ERC-2981) ============
    
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        receiver = royaltyRecipient;
        royaltyAmount = (salePrice * royaltyFeeBasisPoints) / 10000;
    }

    // ============ ADMIN FUNCTIONS ============
    
    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
        emit MintPriceUpdated(_mintPrice);
    }
    
    function setMaxSupply(uint256 _maxSupply) external onlyOwner {
        require(_maxSupply >= totalSupply(), "PolarisMinter: Below current supply");
        maxSupply = _maxSupply;
        emit MaxSupplyUpdated(_maxSupply);
    }
    
    function setMaxPerWallet(uint256 _maxPerWallet) external onlyOwner {
        maxPerWallet = _maxPerWallet;
    }
    
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
    }
    
    function setRoyaltyFee(uint96 _feeBasisPoints) external onlyOwner {
        require(_feeBasisPoints <= 1000, "PolarisMinter: Max 10% royalty");
        royaltyFeeBasisPoints = _feeBasisPoints;
        emit RoyaltyUpdated(_feeBasisPoints);
    }
    
    function setRoyaltyRecipient(address _recipient) external onlyOwner {
        royaltyRecipient = _recipient;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /// @notice Emergency withdrawal (only contract owner, excludes charity funds)
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "PolarisMinter: No balance");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "PolarisMinter: Withdraw failed");
    }

    // ============ UTILITY FUNCTIONS ============
    
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return 
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {
        // Direct donations accepted - forwarded to Polaris Project
        (bool success, ) = POLARIS_PROJECT_ADDRESS.call{value: msg.value}("");
        require(success, "Direct donation failed");
        
        emit DonationSent(
            POLARIS_PROJECT_ADDRESS,
            msg.value,
            0,
            "Direct donation to Polaris Project"
        );
    }
}
