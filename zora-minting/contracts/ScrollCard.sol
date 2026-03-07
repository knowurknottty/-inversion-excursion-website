// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title ScrollCard
 * @dev ERC-721 NFT contract for Scroll-themed collectible cards
 * @notice Minting integration with Zora Coins protocol on Base network
 * @author Zora Minting Developer
 */
contract ScrollCard is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    ERC721Burnable, 
    IERC2981,
    Ownable, 
    ReentrancyGuard 
{
    using Counters for Counters.Counter;

    // ============ State Variables ============
    
    Counters.Counter private _tokenIdCounter;
    
    // Minting configuration
    uint256 public maxSupply = 100000;
    uint256 public maxPerWallet = 100;
    bool public mintingEnabled = true;
    
    // Royalty configuration (ERC-2981)
    uint96 public royaltyFeeBasisPoints = 500; // 5%
    address public royaltyRecipient;
    
    // Card attributes storage
    struct CardAttributes {
        uint256 power;
        uint256 rarity; // 1=Common, 2=Uncommon, 3=Rare, 4=Epic, 5=Legendary
        uint256 chapter;
        string dungeon;
        string extractedQuote;
        uint256 mintTimestamp;
        address minter;
    }
    
    mapping(uint256 => CardAttributes) public cardAttributes;
    mapping(address => uint256) public mintsPerWallet;
    mapping(address => bool) public authorizedMinters;
    
    // Zora integration
    address public zoraCoinAddress;
    bool public zoraIntegrationEnabled;
    
    // ============ Events ============
    
    event CardMinted(
        uint256 indexed tokenId,
        address indexed minter,
        uint256 power,
        uint256 rarity,
        uint256 chapter,
        string dungeon
    );
    
    event AttributesSet(
        uint256 indexed tokenId,
        uint256 power,
        uint256 rarity,
        uint256 chapter
    );
    
    event RoyaltyUpdated(uint96 newFeeBasisPoints);
    event MintingEnabled(bool enabled);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    event ZoraIntegrationSet(address zoraAddress, bool enabled);
    
    // ============ Modifiers ============
    
    modifier onlyAuthorized() {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "ScrollCard: Not authorized to mint"
        );
        _;
    }
    
    modifier whenMintingEnabled() {
        require(mintingEnabled, "ScrollCard: Minting is disabled");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        string memory name,
        string memory symbol,
        address _royaltyRecipient
    ) ERC721(name, symbol) Ownable(msg.sender) {
        royaltyRecipient = _royaltyRecipient == address(0) 
            ? msg.sender 
            : _royaltyRecipient;
        
        // Start token IDs at 1
        _tokenIdCounter.increment();
    }
    
    // ============ Minting Functions ============
    
    /**
     * @dev Main minting function for Zora integration
     * @param to Address to mint the NFT to
     * @param uri IPFS URI for metadata
     * @param attributes Card stats and metadata
     * @return tokenId The ID of the newly minted token
     */
    function mintCard(
        address to,
        string memory uri,
        CardAttributes memory attributes
    ) external onlyAuthorized whenMintingEnabled nonReentrant returns (uint256) {
        require(totalSupply() < maxSupply, "ScrollCard: Max supply reached");
        require(mintsPerWallet[to] < maxPerWallet, "ScrollCard: Wallet limit reached");
        require(bytes(uri).length > 0, "ScrollCard: URI required");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Store attributes
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
            attributes.dungeon
        );
        
        return tokenId;
    }
    
    /**
     * @dev Gasless minting support via paymaster (EIP-4337)
     * @param to Address to mint to
     * @param uri Metadata URI
     * @param attributes Card stats
     * @param paymasterData Additional data for paymaster validation
     */
    function mintCardGasless(
        address to,
        string memory uri,
        CardAttributes memory attributes,
        bytes calldata paymasterData
    ) external onlyAuthorized whenMintingEnabled nonReentrant returns (uint256) {
        // Validate paymaster data (custom logic for your paymaster)
        require(
            _validatePaymasterData(paymasterData),
            "ScrollCard: Invalid paymaster data"
        );
        
        return this.mintCard(to, uri, attributes);
    }
    
    /**
     * @dev Batch mint multiple cards (for rewards/achievements)
     */
    function batchMint(
        address[] calldata recipients,
        string[] calldata uris,
        CardAttributes[] calldata attributesArray
    ) external onlyAuthorized whenMintingEnabled nonReentrant {
        require(
            recipients.length == uris.length && uris.length == attributesArray.length,
            "ScrollCard: Array length mismatch"
        );
        require(
            totalSupply() + recipients.length <= maxSupply,
            "ScrollCard: Exceeds max supply"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, uris[i]);
            cardAttributes[tokenId] = attributesArray[i];
            cardAttributes[tokenId].mintTimestamp = block.timestamp;
            cardAttributes[tokenId].minter = recipients[i];
            
            mintsPerWallet[recipients[i]]++;
            
            emit CardMinted(
                tokenId,
                recipients[i],
                attributesArray[i].power,
                attributesArray[i].rarity,
                attributesArray[i].chapter,
                attributesArray[i].dungeon
            );
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get full card data including attributes
     */
    function getCardData(uint256 tokenId) 
        external 
        view 
        returns (
            address owner,
            string memory uri,
            CardAttributes memory attributes
        ) 
    {
        require(_exists(tokenId), "ScrollCard: Query for nonexistent token");
        
        owner = ownerOf(tokenId);
        uri = tokenURI(tokenId);
        attributes = cardAttributes[tokenId];
    }
    
    /**
     * @dev Get cards owned by an address
     */
    function getCardsByOwner(address owner) 
        external 
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
    
    /**
     * @dev Get rarity name from rarity level
     */
    function getRarityName(uint256 rarity) public pure returns (string memory) {
        if (rarity == 1) return "Common";
        if (rarity == 2) return "Uncommon";
        if (rarity == 3) return "Rare";
        if (rarity == 4) return "Epic";
        if (rarity == 5) return "Legendary";
        return "Unknown";
    }
    
    // ============ Royalty (ERC-2981) ============
    
    /**
     * @dev EIP-2981 royalty info
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        require(_exists(tokenId), "ScrollCard: Query for nonexistent token");
        
        receiver = royaltyRecipient;
        royaltyAmount = (salePrice * royaltyFeeBasisPoints) / 10000;
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
    
    // ============ Admin Functions ============
    
    function setRoyaltyFee(uint96 _feeBasisPoints) external onlyOwner {
        require(_feeBasisPoints <= 1000, "ScrollCard: Max 10% royalty");
        royaltyFeeBasisPoints = _feeBasisPoints;
        emit RoyaltyUpdated(_feeBasisPoints);
    }
    
    function setRoyaltyRecipient(address _recipient) external onlyOwner {
        royaltyRecipient = _recipient;
    }
    
    function setMintingEnabled(bool _enabled) external onlyOwner {
        mintingEnabled = _enabled;
        emit MintingEnabled(_enabled);
    }
    
    function setMaxSupply(uint256 _maxSupply) external onlyOwner {
        require(_maxSupply >= totalSupply(), "ScrollCard: Below current supply");
        maxSupply = _maxSupply;
        emit MaxSupplyUpdated(_maxSupply);
    }
    
    function setMaxPerWallet(uint256 _maxPerWallet) external onlyOwner {
        maxPerWallet = _maxPerWallet;
    }
    
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
    }
    
    function setZoraIntegration(address _zoraCoinAddress, bool _enabled) external onlyOwner {
        zoraCoinAddress = _zoraCoinAddress;
        zoraIntegrationEnabled = _enabled;
        emit ZoraIntegrationSet(_zoraCoinAddress, _enabled);
    }
    
    // ============ Internal Functions ============
    
    function _validatePaymasterData(bytes calldata data) internal pure returns (bool) {
        // Implement your paymaster validation logic
        // This is a placeholder - customize based on your paymaster
        return data.length > 0;
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
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
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
