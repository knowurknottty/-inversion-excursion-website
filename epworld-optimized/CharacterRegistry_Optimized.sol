// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./IEPWORLD.sol";
import "./PowerMath.sol";

// Minimal interfaces
interface IFileNFT {
    struct FileMetadata {
        uint32 powerValue;
        uint8 state;
        uint32 submittedAt;
    }
    function getFileMetadata(uint256 tokenId) external view returns (FileMetadata memory);
    function attachToCharacter(uint256 fileId, uint256 characterId) external;
    function detachFromCharacter(uint256 fileId, uint256 characterId) external;
}

interface IPowerCalc {
    function calculatePower(
        uint256 characterId,
        uint256[] calldata fileIds,
        uint256 mentionCount,
        uint8 alignment
    ) external view returns (uint256);
    function getTierFromPower(uint256 power) external pure returns (uint8);
}

/**
 * @title CharacterRegistry - Optimized
 * @notice Character management with packed storage (Gas Optimized for Base L2)
 * @dev OPTIMIZATIONS:
 *      - Character struct: 9 slots → 4 slots
 *      - Batch file attachment
 *      - Unchecked math
 *      - Mapping-based file tracking for O(1) lookups
 */
contract CharacterRegistry_Optimized is Ownable, Pausable, ReentrancyGuard {
    
    /// @notice Packed Character struct (saves 5 storage slots)
    struct Character {
        uint32 id;              // Slot 0
        uint32 mentionCount;    // Slot 0
        uint32 basePower;       // Slot 0
        uint32 totalPower;      // Slot 0 (4*4=16 bytes, 4 bytes padding or reorder)
        uint32 createdAt;       // Slot 1
        uint32 lastUpdated;     // Slot 1
        uint16 tier;            // Slot 1
        uint8 alignment;        // Slot 1
        bool isLegendary;       // Slot 1
        uint16 legendaryClass;  // Slot 1 (4+4+2+1+1+2=14 bytes, 6 left)
        address owner;          // Slot 2
        // attachedFiles moved to separate mapping for gas efficiency
    }
    
    struct LegendaryClass {
        uint32 minPower;
        uint16 bonusMultiplier;
        bool isActive;
        bytes29 name;           // Packed name storage (limited to 29 chars)
    }
    
    // ============ State Variables ============
    
    mapping(uint32 => Character) public characters;
    mapping(uint32 => uint32[]) private characterFiles;     // characterId -> fileIds
    mapping(uint32 => mapping(uint32 => uint32)) private fileIndex; // characterId -> fileId -> index+1
    mapping(bytes32 => uint32) public nameToId;
    mapping(address => uint32[]) public userCharacters;
    mapping(address => bool) public authorizedMinters;
    mapping(uint16 => LegendaryClass) public legendaryClasses;
    
    uint32 public nextCharacterId = 1;
    
    IFileNFT public fileNFT;
    IPowerCalc public powerCalculator;
    
    // Custom errors
    error InvalidName();
    error CharacterNotFound();
    error FileNotFound();
    error NotAuthorized();
    error FileAlreadyAttached();
    error FileNotAttached();
    error NotCharacterOwner();
    error AlreadyLegendary();
    error NotLegendary();
    error InvalidAlignment();
    error NameExists();
    error InvalidClass();
    error InvalidFileState();
    
    // Events
    event CharacterCreated(uint32 indexed charId, bytes32 indexed nameHash, uint8 alignment, address indexed owner);
    event CharacterUpdated(uint32 indexed charId, uint32 newPower, uint8 newTier);
    event AlignmentChanged(uint32 indexed charId, uint8 oldAlign, uint8 newAlign);
    event FilesAttached(uint32 indexed charId, uint32[] fileIds);
    event FilesDetached(uint32 indexed charId, uint32[] fileIds);
    event Transformation(uint32 indexed charId, uint8 oldTier, uint8 newTier);
    event LegendaryClassAssigned(uint32 indexed charId, uint16 classId);
    
    constructor(address _owner, address _fileNFT, address _powerCalc) Ownable(_owner) {
        fileNFT = IFileNFT(_fileNFT);
        powerCalculator = IPowerCalc(_powerCalc);
        _initializeLegendaryClasses();
    }
    
    modifier onlyMinter() {
        if (!authorizedMinters[msg.sender] && msg.sender != owner()) revert NotAuthorized();
        _;
    }
    
    // ============ Character Creation ============
    
    function createCharacter(
        bytes32 _nameHash,
        uint32 _mentionCount,
        uint8 _alignment
    ) external onlyMinter whenNotPaused returns (uint32 characterId) {
        if (_nameHash == bytes32(0)) revert InvalidName();
        if (_alignment > 3) revert InvalidAlignment();
        if (nameToId[_nameHash] != 0) revert NameExists();
        
        unchecked {
            characterId = nextCharacterId++;
            uint32 basePower = _mentionCount * 10;
            
            characters[characterId] = Character({
                id: characterId,
                mentionCount: _mentionCount,
                basePower: basePower,
                totalPower: basePower,
                createdAt: uint32(block.timestamp),
                lastUpdated: uint32(block.timestamp),
                tier: 0, // BASE
                alignment: _alignment,
                isLegendary: false,
                legendaryClass: 0,
                owner: msg.sender
            });
            
            nameToId[_nameHash] = characterId;
            userCharacters[msg.sender].push(characterId);
            
            emit CharacterCreated(characterId, _nameHash, _alignment, msg.sender);
        }
    }
    
    // ============ File Attachment - Batch Operations ============
    
    /**
     * @notice Attach multiple files in one transaction
     * @dev Saves ~20k gas per additional file vs individual calls
     */
    function attachFiles(uint32 _charId, uint32[] calldata _fileIds) external nonReentrant whenNotPaused {
        Character storage character = characters[_charId];
        if (character.id == 0) revert CharacterNotFound();
        if (character.owner != msg.sender) revert NotCharacterOwner();
        
        uint256 len = _fileIds.length;
        if (len == 0) revert InvalidName();
        if (len > 10) revert InvalidName(); // Max 10 per batch
        
        for (uint256 i = 0; i < len; ) {
            uint32 fileId = _fileIds[i];
            
            // Check file not already attached to this character
            if (fileIndex[_charId][fileId] != 0) revert FileAlreadyAttached();
            
            // Verify file state (single external call)
            IFileNFT.FileMetadata memory file = fileNFT.getFileMetadata(fileId);
            if (file.state != 2) revert InvalidFileState(); // VERIFIED = 2
            if (file.submittedAt == 0) revert FileNotFound();
            
            // Add file
            characterFiles[_charId].push(fileId);
            fileIndex[_charId][fileId] = uint32(characterFiles[_charId].length);
            
            // Notify FileNFT
            fileNFT.attachToCharacter(fileId, _charId);
            
            unchecked { ++i; }
        }
        
        // Recalculate power once after all attachments
        _recalculatePower(_charId);
        
        emit FilesAttached(_charId, _fileIds);
    }
    
    /**
     * @notice Detach multiple files in one transaction
     */
    function detachFiles(uint32 _charId, uint32[] calldata _fileIds) external nonReentrant whenNotPaused {
        Character storage character = characters[_charId];
        if (character.id == 0) revert CharacterNotFound();
        if (character.owner != msg.sender) revert NotCharacterOwner();
        
        uint256 len = _fileIds.length;
        for (uint256 i = 0; i < len; ) {
            uint32 fileId = _fileIds[i];
            
            // O(1) lookup using mapping
            uint32 idx = fileIndex[_charId][fileId];
            if (idx == 0) revert FileNotAttached();
            
            // Swap and pop
            uint32[] storage files = characterFiles[_charId];
            uint256 lastIdx = files.length - 1;
            uint256 arrayIdx = idx - 1;
            
            if (arrayIdx != lastIdx) {
                uint32 lastFile = files[lastIdx];
                files[arrayIdx] = lastFile;
                fileIndex[_charId][lastFile] = idx;
            }
            files.pop();
            delete fileIndex[_charId][fileId];
            
            // Notify FileNFT
            fileNFT.detachFromCharacter(fileId, _charId);
            
            unchecked { ++i; }
        }
        
        _recalculatePower(_charId);
        
        emit FilesDetached(_charId, _fileIds);
    }
    
    // ============ Character Management ============
    
    function updateAlignment(uint32 _charId, uint8 _newAlignment) external whenNotPaused {
        Character storage character = characters[_charId];
        if (character.id == 0) revert CharacterNotFound();
        if (character.owner != msg.sender) revert NotCharacterOwner();
        if (character.alignment == _newAlignment) revert InvalidAlignment();
        
        uint8 oldAlignment = character.alignment;
        character.alignment = _newAlignment;
        
        _recalculatePower(_charId);
        
        emit AlignmentChanged(_charId, oldAlignment, _newAlignment);
    }
    
    function transform(uint32 _charId) external whenNotPaused returns (bool success, uint8 newTier) {
        Character storage character = characters[_charId];
        if (character.id == 0) revert CharacterNotFound();
        if (character.owner != msg.sender) revert NotCharacterOwner();
        
        (success, newTier) = PowerMath.checkTransformation(character.totalPower, uint8(character.tier));
        
        if (success) {
            uint8 oldTier = uint8(character.tier);
            character.tier = newTier;
            
            _recalculatePower(_charId);
            
            emit Transformation(_charId, oldTier, newTier);
        }
    }
    
    function assignLegendaryClass(uint32 _charId, uint16 _classId) external onlyOwner {
        Character storage character = characters[_charId];
        if (character.id == 0) revert CharacterNotFound();
        if (character.isLegendary) revert AlreadyLegendary();
        
        LegendaryClass storage lc = legendaryClasses[_classId];
        if (!lc.isActive) revert InvalidClass();
        if (character.totalPower < lc.minPower) revert InvalidClass();
        
        character.isLegendary = true;
        character.legendaryClass = _classId;
        character.alignment = 3; // LEGENDARY
        
        _recalculatePower(_charId);
        
        emit LegendaryClassAssigned(_charId, _classId);
    }
    
    // ============ Power Calculation ============
    
    function _recalculatePower(uint32 _charId) internal {
        Character storage character = characters[_charId];
        
        uint256[] memory fileIds = new uint256[](characterFiles[_charId].length);
        for (uint256 i = 0; i < characterFiles[_charId].length; ) {
            fileIds[i] = characterFiles[_charId][i];
            unchecked { ++i; }
        }
        
        uint256 newPower = powerCalculator.calculatePower(
            _charId,
            fileIds,
            character.mentionCount,
            character.alignment
        );
        
        // Apply legendary bonus
        if (character.isLegendary && character.legendaryClass > 0) {
            unchecked {
                newPower = (newPower * legendaryClasses[character.legendaryClass].bonusMultiplier) / 10000;
            }
        }
        
        character.totalPower = uint32(newPower > type(uint32).max ? type(uint32).max : newPower);
        character.lastUpdated = uint32(block.timestamp);
        
        // Check tier upgrade
        uint8 newTier = powerCalculator.getTierFromPower(newPower);
        if (newTier > character.tier) {
            character.tier = newTier;
        }
        
        emit CharacterUpdated(_charId, character.totalPower, uint8(character.tier));
    }
    
    // ============ View Functions ============
    
    function getCharacter(uint32 _charId) external view returns (Character memory) {
        return characters[_charId];
    }
    
    function getCharacterPower(uint32 _charId) external view returns (uint32) {
        return characters[_charId].totalPower;
    }
    
    function getCharacterTier(uint32 _charId) external view returns (uint8) {
        return uint8(characters[_charId].tier);
    }
    
    function getAttachedFiles(uint32 _charId) external view returns (uint32[] memory) {
        return characterFiles[_charId];
    }
    
    function getUserCharacters(address _user) external view returns (uint32[] memory) {
        return userCharacters[_user];
    }
    
    function isFileAttached(uint32 _charId, uint32 _fileId) external view returns (bool) {
        return fileIndex[_charId][_fileId] != 0;
    }
    
    function canTransform(uint32 _charId) external view returns (bool, uint8) {
        Character memory c = characters[_charId];
        return PowerMath.checkTransformation(c.totalPower, uint8(c.tier));
    }
    
    function getTotalCharacters() external view returns (uint32) {
        unchecked { return nextCharacterId - 1; }
    }
    
    // ============ Admin ============
    
    function _initializeLegendaryClasses() internal {
        legendaryClasses[1] = LegendaryClass({
            minPower: 25000,
            bonusMultiplier: 13000,
            isActive: true,
            name: bytes29("The Architect")
        });
        
        legendaryClasses[2] = LegendaryClass({
            minPower: 50000,
            bonusMultiplier: 15000,
            isActive: true,
            name: bytes29("The Mastermind")
        });
        
        legendaryClasses[3] = LegendaryClass({
            minPower: 100000,
            bonusMultiplier: 20000,
            isActive: true,
            name: bytes29("The Enigma")
        });
    }
    
    function addLegendaryClass(
        uint16 _classId,
        bytes29 _name,
        uint32 _minPower,
        uint16 _bonusMult
    ) external onlyOwner {
        legendaryClasses[_classId] = LegendaryClass({
            minPower: _minPower,
            bonusMultiplier: _bonusMult,
            isActive: true,
            name: _name
        });
    }
    
    function setLegendaryClassActive(uint16 _classId, bool _active) external onlyOwner {
        legendaryClasses[_classId].isActive = _active;
    }
    
    function setMinterAuth(address _minter, bool _auth) external onlyOwner {
        authorizedMinters[_minter] = _auth;
    }
    
    function setFileNFT(address _fileNFT) external onlyOwner {
        fileNFT = IFileNFT(_fileNFT);
    }
    
    function setPowerCalculator(address _calc) external onlyOwner {
        powerCalculator = IPowerCalc(_calc);
    }
    
    function transferCharacter(uint32 _charId, address _newOwner) external whenNotPaused {
        Character storage c = characters[_charId];
        if (c.id == 0) revert CharacterNotFound();
        if (c.owner != msg.sender) revert NotCharacterOwner();
        if (_newOwner == address(0)) revert InvalidName();
        
        // Remove from old owner
        uint32[] storage oldChars = userCharacters[msg.sender];
        for (uint256 i = 0; i < oldChars.length; ) {
            if (oldChars[i] == _charId) {
                oldChars[i] = oldChars[oldChars.length - 1];
                oldChars.pop();
                break;
            }
            unchecked { ++i; }
        }
        
        userCharacters[_newOwner].push(_charId);
        c.owner = _newOwner;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
