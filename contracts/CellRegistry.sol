// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CellRegistry
 * @author Inversion Collective
 * @notice Registry for Cell formations, members, and battle history
 * @dev Tracks all cell-related data and coordination history
 * @custom:security-contact security@inversionexcursion.xyz
 */
contract CellRegistry is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    // ============ Roles ============
    bytes32 public constant CELL_MANAGER_ROLE = keccak256("CELL_MANAGER_ROLE");
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");

    // ============ Structs ============
    
    /**
     * @notice Cell formation data
     * @param id Unique cell ID
     * @param leader Cell leader address
     * @param members Array of member addresses
     * @param formedAt Block timestamp of formation
     * @param lastActive Block timestamp of last activity
     * @param battlesWon Total battles won
     * @param battlesLost Total battles lost
     * @param totalScore Cumulative score across all battles
     * @param active Whether the cell is currently active
     * @param name Cell name
     * @param metadataURI Optional metadata URI
     */
    struct Cell {
        uint256 id;
        address leader;
        address[] members;
        uint256 formedAt;
        uint256 lastActive;
        uint256 battlesWon;
        uint256 battlesLost;
        uint256 totalScore;
        bool active;
        string name;
        string metadataURI;
    }
    
    /**
     * @notice Battle record
     * @param id Battle ID
     * @param cellId Participating cell ID
     * @param dungeon Dungeon ID
     * @param timestamp Block timestamp
     * @param won Whether the battle was won
     * @param score Battle score
     * @param participants Array of participant addresses
     * @param victoryTokenId Minted victory token ID (0 if lost)
     */
    struct Battle {
        uint256 id;
        uint256 cellId;
        uint8 dungeon;
        uint256 timestamp;
        bool won;
        uint256 score;
        address[] participants;
        uint256 victoryTokenId;
    }
    
    /**
     * @notice Player cell history entry
     * @param cellId Cell ID
     * @param joinedAt When player joined
     * @param leftAt When player left (0 if still member)
     * @param role Player role in cell (0=member, 1=leader)
     */
    struct PlayerCellHistory {
        uint256 cellId;
        uint256 joinedAt;
        uint256 leftAt;
        uint8 role;
    }

    // ============ State Variables ============
    Counters.Counter private _cellIdCounter;
    Counters.Counter private _battleIdCounter;
    
    /// @notice Mapping from cell ID to Cell data
    mapping(uint256 => Cell) private _cells;
    
    /// @notice Mapping from battle ID to Battle data
    mapping(uint256 => Battle) private _battles;
    
    /// @notice Mapping from player address to current cell ID (0 if none)
    mapping(address => uint256) public playerCell;
    
    /// @notice Mapping from player to cell history
    mapping(address => PlayerCellHistory[]) private _playerHistory;
    
    /// @notice Mapping from cell ID to battle IDs
    mapping(uint256 => uint256[]) private _cellBattles;
    
    /// @notice Array of all active cell IDs
    uint256[] private _activeCellIds;
    
    /// @notice Mapping from cell ID to index in _activeCellIds
    mapping(uint256 => uint256) private _cellIdToActiveIndex;
    
    /// @notice Maximum members per cell
    uint256 public maxCellSize;
    
    /// @notice Cooldown period between cell formations (seconds)
    uint256 public formationCooldown;
    
    /// @notice Mapping from player to last cell formation time
    mapping(address => uint256) public lastFormationTime;
    
    /// @notice Reputation scores for cells
    mapping(uint256 => uint256) public cellReputation;
    
    /// @notice Reputation scores for players
    mapping(address => uint256) public playerReputation;

    // ============ Events ============
    
    /**
     * @notice Emitted when a new cell is formed
     * @param cellId New cell ID
     * @param leader Cell leader address
     * @param members Array of initial members
     * @param name Cell name
     */
    event CellFormed(
        uint256 indexed cellId,
        address indexed leader,
        address[] members,
        string name
    );
    
    /**
     * @notice Emitted when a member joins a cell
     * @param cellId Cell ID
     * @param member Member address
     */
    event MemberJoined(uint256 indexed cellId, address indexed member);
    
    /**
     * @notice Emitted when a member leaves a cell
     * @param cellId Cell ID
     * @param member Member address
     * @param reason Reason for leaving (0=left, 1=kicked, 2=disbanded)
     */
    event MemberLeft(uint256 indexed cellId, address indexed member, uint8 reason);
    
    /**
     * @notice Emitted when a cell is disbanded
     * @param cellId Cell ID
     * @param leader Address that disbanded
     */
    event CellDisbanded(uint256 indexed cellId, address indexed leader);
    
    /**
     * @notice Emitted when a cell leader changes
     * @param cellId Cell ID
     * @param previousLeader Previous leader address
     * @param newLeader New leader address
     */
    event LeaderChanged(
        uint256 indexed cellId,
        address indexed previousLeader,
        address indexed newLeader
    );
    
    /**
     * @notice Emitted when a battle is recorded
     * @param battleId Battle ID
     * @param cellId Participating cell ID
     * @param dungeon Dungeon ID
     * @param won Whether battle was won
     * @param score Battle score
     */
    event BattleRecorded(
        uint256 indexed battleId,
        uint256 indexed cellId,
        uint8 indexed dungeon,
        bool won,
        uint256 score
    );
    
    /**
     * @notice Emitted when cell reputation changes
     * @param cellId Cell ID
     * @param oldReputation Previous reputation
     * @param newReputation New reputation
     * @param reason Reason for change
     */
    event ReputationUpdated(
        uint256 indexed cellId,
        uint256 oldReputation,
        uint256 newReputation,
        string reason
    );

    // ============ Errors ============
    error CellDoesNotExist(uint256 cellId);
    error AlreadyInCell(address player, uint256 cellId);
    error CellFull(uint256 cellId, uint256 maxSize);
    error NotCellLeader(address caller, uint256 cellId);
    error NotCellMember(address caller, uint256 cellId);
    error CooldownActive(uint256 remaining);
    error InvalidFormation();
    error CellNotActive(uint256 cellId);
    error CannotRemoveLeader();
    error AlreadyMemberOfCell(address player);

    // ============ Modifiers ============
    modifier onlyCellLeader(uint256 cellId) {
        if (_cells[cellId].leader != msg.sender) {
            revert NotCellLeader(msg.sender, cellId);
        }
        _;
    }
    
    modifier onlyCellMember(uint256 cellId) {
        if (!_isMember(cellId, msg.sender)) {
            revert NotCellMember(msg.sender, cellId);
        }
        _;
    }
    
    modifier cellExists(uint256 cellId) {
        if (_cells[cellId].id == 0) {
            revert CellDoesNotExist(cellId);
        }
        _;
    }

    // ============ Constructor ============
    
    /**
     * @notice Initialize CellRegistry
     * @param admin Admin address
     * @param _maxCellSize Maximum members per cell
     * @param _formationCooldown Cooldown between formations (seconds)
     */
    constructor(
        address admin,
        uint256 _maxCellSize,
        uint256 _formationCooldown
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CELL_MANAGER_ROLE, admin);
        _grantRole(GAME_MASTER_ROLE, admin);
        
        maxCellSize = _maxCellSize;
        formationCooldown = _formationCooldown;
        
        // Start counters at 1 to avoid 0 being a valid ID
        _cellIdCounter.increment();
        _battleIdCounter.increment();
    }

    // ============ Cell Management Functions ============
    
    /**
     * @notice Form a new cell
     * @param members Array of member addresses (excluding leader)
     * @param name Cell name
     * @return cellId ID of the newly created cell
     */
    function createCell(
        address[] calldata members,
        string calldata name
    ) external nonReentrant returns (uint256) {
        // Check cooldown
        uint256 timeSinceLastFormation = block.timestamp - lastFormationTime[msg.sender];
        if (timeSinceLastFormation < formationCooldown) {
            revert CooldownActive(formationCooldown - timeSinceLastFormation);
        }
        
        // Check if already in a cell
        if (playerCell[msg.sender] != 0) {
            revert AlreadyInCell(msg.sender, playerCell[msg.sender]);
        }
        
        // Check member count
        if (members.length >= maxCellSize) {
            revert CellFull(0, maxCellSize);
        }
        
        // Verify members aren't in other cells
        for (uint256 i = 0; i < members.length; i++) {
            if (playerCell[members[i]] != 0) {
                revert AlreadyMemberOfCell(members[i]);
            }
            if (members[i] == msg.sender) {
                revert InvalidFormation();
            }
        }
        
        uint256 cellId = _cellIdCounter.current();
        _cellIdCounter.increment();
        
        // Create cell
        Cell storage cell = _cells[cellId];
        cell.id = cellId;
        cell.leader = msg.sender;
        cell.formedAt = block.timestamp;
        cell.lastActive = block.timestamp;
        cell.active = true;
        cell.name = name;
        
        // Add members
        for (uint256 i = 0; i < members.length; i++) {
            cell.members.push(members[i]);
            playerCell[members[i]] = cellId;
            _playerHistory[members[i]].push(PlayerCellHistory({
                cellId: cellId,
                joinedAt: block.timestamp,
                leftAt: 0,
                role: 0
            }));
        }
        
        // Set leader's cell
        playerCell[msg.sender] = cellId;
        lastFormationTime[msg.sender] = block.timestamp;
        _playerHistory[msg.sender].push(PlayerCellHistory({
            cellId: cellId,
            joinedAt: block.timestamp,
            leftAt: 0,
            role: 1
        }));
        
        // Add to active cells
        _cellIdToActiveIndex[cellId] = _activeCellIds.length;
        _activeCellIds.push(cellId);
        
        // Initial reputation
        cellReputation[cellId] = 100;
        
        emit CellFormed(cellId, msg.sender, members, name);
        
        return cellId;
    }
    
    /**
     * @notice Add a member to an existing cell
     * @param cellId Cell ID
     * @param member Member address to add
     */
    function addMember(
        uint256 cellId,
        address member
    ) external onlyCellLeader(cellId) cellExists(cellId) nonReentrant {
        Cell storage cell = _cells[cellId];
        
        if (!cell.active) revert CellNotActive(cellId);
        if (cell.members.length >= maxCellSize - 1) { // -1 because leader not in members array
            revert CellFull(cellId, maxCellSize);
        }
        if (playerCell[member] != 0) {
            revert AlreadyMemberOfCell(member);
        }
        
        cell.members.push(member);
        playerCell[member] = cellId;
        cell.lastActive = block.timestamp;
        
        _playerHistory[member].push(PlayerCellHistory({
            cellId: cellId,
            joinedAt: block.timestamp,
            leftAt: 0,
            role: 0
        }));
        
        emit MemberJoined(cellId, member);
    }
    
    /**
     * @notice Remove a member from a cell
     * @param cellId Cell ID
     * @param member Member address to remove
     */
    function removeMember(
        uint256 cellId,
        address member
    ) external onlyCellLeader(cellId) cellExists(cellId) nonReentrant {
        Cell storage cell = _cells[cellId];
        
        if (member == cell.leader) revert CannotRemoveLeader();
        
        // Find and remove member
        for (uint256 i = 0; i < cell.members.length; i++) {
            if (cell.members[i] == member) {
                // Remove from array (swap with last and pop)
                cell.members[i] = cell.members[cell.members.length - 1];
                cell.members.pop();
                break;
            }
        }
        
        playerCell[member] = 0;
        cell.lastActive = block.timestamp;
        
        // Update history
        PlayerCellHistory[] storage history = _playerHistory[member];
        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].cellId == cellId && history[i].leftAt == 0) {
                history[i].leftAt = block.timestamp;
                break;
            }
        }
        
        emit MemberLeft(cellId, member, 1);
    }
    
    /**
     * @notice Leave current cell
     * @param cellId Cell ID to leave
     */
    function leaveCell(uint256 cellId) external cellExists(cellId) nonReentrant {
        Cell storage cell = _cells[cellId];
        
        if (msg.sender == cell.leader) revert CannotRemoveLeader();
        if (!_isMember(cellId, msg.sender)) revert NotCellMember(msg.sender, cellId);
        
        // Remove from members array
        for (uint256 i = 0; i < cell.members.length; i++) {
            if (cell.members[i] == msg.sender) {
                cell.members[i] = cell.members[cell.members.length - 1];
                cell.members.pop();
                break;
            }
        }
        
        playerCell[msg.sender] = 0;
        cell.lastActive = block.timestamp;
        
        // Update history
        PlayerCellHistory[] storage history = _playerHistory[msg.sender];
        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].cellId == cellId && history[i].leftAt == 0) {
                history[i].leftAt = block.timestamp;
                break;
            }
        }
        
        emit MemberLeft(cellId, msg.sender, 0);
    }
    
    /**
     * @notice Transfer leadership of a cell
     * @param cellId Cell ID
     * @param newLeader New leader address (must be existing member)
     */
    function transferLeadership(
        uint256 cellId,
        address newLeader
    ) external onlyCellLeader(cellId) cellExists(cellId) nonReentrant {
        Cell storage cell = _cells[cellId];
        
        // Verify new leader is a member
        bool isMember = false;
        for (uint256 i = 0; i < cell.members.length; i++) {
            if (cell.members[i] == newLeader) {
                isMember = true;
                break;
            }
        }
        if (!isMember) revert NotCellMember(newLeader, cellId);
        
        address previousLeader = cell.leader;
        cell.leader = newLeader;
        
        // Move previous leader to members
        cell.members.push(previousLeader);
        
        // Remove new leader from members
        for (uint256 i = 0; i < cell.members.length; i++) {
            if (cell.members[i] == newLeader) {
                cell.members[i] = cell.members[cell.members.length - 1];
                cell.members.pop();
                break;
            }
        }
        
        // Update history
        _updateRoleInHistory(previousLeader, cellId, 0);
        _updateRoleInHistory(newLeader, cellId, 1);
        
        emit LeaderChanged(cellId, previousLeader, newLeader);
    }
    
    /**
     * @notice Disband a cell
     * @param cellId Cell ID to disband
     */
    function disbandCell(
        uint256 cellId
    ) external onlyCellLeader(cellId) cellExists(cellId) nonReentrant {
        Cell storage cell = _cells[cellId];
        
        cell.active = false;
        
        // Clear all members
        for (uint256 i = 0; i < cell.members.length; i++) {
            address member = cell.members[i];
            playerCell[member] = 0;
            
            // Update history
            PlayerCellHistory[] storage history = _playerHistory[member];
            for (uint256 j = 0; j < history.length; j++) {
                if (history[j].cellId == cellId && history[j].leftAt == 0) {
                    history[j].leftAt = block.timestamp;
                    break;
                }
            }
            
            emit MemberLeft(cellId, member, 2);
        }
        
        // Clear leader
        playerCell[cell.leader] = 0;
        PlayerCellHistory[] storage leaderHistory = _playerHistory[cell.leader];
        for (uint256 i = 0; i < leaderHistory.length; i++) {
            if (leaderHistory[i].cellId == cellId && leaderHistory[i].leftAt == 0) {
                leaderHistory[i].leftAt = block.timestamp;
                break;
            }
        }
        
        delete cell.members;
        
        // Remove from active cells
        _removeActiveCell(cellId);
        
        emit CellDisbanded(cellId, msg.sender);
    }

    // ============ Battle Recording Functions ============
    
    /**
     * @notice Record a battle result
     * @param cellId Participating cell ID
     * @param dungeon Dungeon ID
     * @param won Whether battle was won
     * @param score Battle score
     * @param participants Array of participant addresses
     * @param victoryTokenId Victory token ID (0 if lost)
     * @return battleId ID of the recorded battle
     * @dev Only callable by GAME_MASTER_ROLE
     */
    function recordBattle(
        uint256 cellId,
        uint8 dungeon,
        bool won,
        uint256 score,
        address[] calldata participants,
        uint256 victoryTokenId
    ) external onlyRole(GAME_MASTER_ROLE) cellExists(cellId) returns (uint256) {
        Cell storage cell = _cells[cellId];
        
        uint256 battleId = _battleIdCounter.current();
        _battleIdCounter.increment();
        
        _battles[battleId] = Battle({
            id: battleId,
            cellId: cellId,
            dungeon: dungeon,
            timestamp: block.timestamp,
            won: won,
            score: score,
            participants: participants,
            victoryTokenId: victoryTokenId
        });
        
        _cellBattles[cellId].push(battleId);
        
        if (won) {
            cell.battlesWon++;
        } else {
            cell.battlesLost++;
        }
        cell.totalScore += score;
        cell.lastActive = block.timestamp;
        
        // Update reputations
        _updateReputation(cellId, won, score);
        
        emit BattleRecorded(battleId, cellId, dungeon, won, score);
        
        return battleId;
    }
    
    /**
     * @notice Update cell metadata
     * @param cellId Cell ID
     * @param name New name
     * @param metadataURI New metadata URI
     */
    function updateCellMetadata(
        uint256 cellId,
        string calldata name,
        string calldata metadataURI
    ) external onlyCellLeader(cellId) cellExists(cellId) {
        Cell storage cell = _cells[cellId];
        cell.name = name;
        cell.metadataURI = metadataURI;
    }

    // ============ View Functions ============
    
    /**
     * @notice Get cell data
     * @param cellId Cell ID
     * @return Cell struct
     */
    function getCell(uint256 cellId) external view returns (Cell memory) {
        return _cells[cellId];
    }
    
    /**
     * @notice Get battle data
     * @param battleId Battle ID
     * @return Battle struct
     */
    function getBattle(uint256 battleId) external view returns (Battle memory) {
        return _battles[battleId];
    }
    
    /**
     * @notice Get all members of a cell (including leader)
     * @param cellId Cell ID
     * @return Array of member addresses
     */
    function getAllMembers(uint256 cellId) external view returns (address[] memory) {
        Cell storage cell = _cells[cellId];
        address[] memory allMembers = new address[](cell.members.length + 1);
        allMembers[0] = cell.leader;
        for (uint256 i = 0; i < cell.members.length; i++) {
            allMembers[i + 1] = cell.members[i];
        }
        return allMembers;
    }
    
    /**
     * @notice Get battle history for a cell
     * @param cellId Cell ID
     * @return Array of battle IDs
     */
    function getCellBattles(uint256 cellId) external view returns (uint256[] memory) {
        return _cellBattles[cellId];
    }
    
    /**
     * @notice Get player cell history
     * @param player Player address
     * @return Array of history entries
     */
    function getPlayerHistory(address player) 
        external 
        view 
        returns (PlayerCellHistory[] memory) 
    {
        return _playerHistory[player];
    }
    
    /**
     * @notice Get all active cells
     * @return Array of active cell IDs
     */
    function getActiveCells() external view returns (uint256[] memory) {
        return _activeCellIds;
    }
    
    /**
     * @notice Get total number of cells created
     * @return Total cell count
     */
    function getTotalCells() external view returns (uint256) {
        return _cellIdCounter.current() - 1;
    }
    
    /**
     * @notice Get total number of battles recorded
     * @return Total battle count
     */
    function getTotalBattles() external view returns (uint256) {
        return _battleIdCounter.current() - 1;
    }
    
    /**
     * @notice Get cell statistics
     * @param cellId Cell ID
     * @return winRate Win rate percentage (0-10000 for 0-100.00%)
     * @return totalBattles Total battles
     * @return averageScore Average battle score
     */
    function getCellStats(uint256 cellId) 
        external 
        view 
        returns (uint256 winRate, uint256 totalBattles, uint256 averageScore) 
    {
        Cell storage cell = _cells[cellId];
        totalBattles = cell.battlesWon + cell.battlesLost;
        
        if (totalBattles > 0) {
            winRate = (cell.battlesWon * 10000) / totalBattles;
            averageScore = cell.totalScore / totalBattles;
        }
        
        return (winRate, totalBattles, averageScore);
    }
    
    /**
     * @notice Check if address is member of cell
     * @param cellId Cell ID
     * @param player Player address
     * @return True if member
     */
    function isMember(uint256 cellId, address player) external view returns (bool) {
        return _isMember(cellId, player);
    }
    
    /**
     * @notice Get leaderboard of top cells by reputation
     * @param count Number of cells to return
     * @return cellIds Array of cell IDs
     * @return reputations Array of reputation scores
     */
    function getLeaderboard(uint256 count) 
        external 
        view 
        returns (uint256[] memory cellIds, uint256[] memory reputations) 
    {
        uint256 resultCount = count > _activeCellIds.length ? _activeCellIds.length : count;
        cellIds = new uint256[](resultCount);
        reputations = new uint256[](resultCount);
        
        // Simple sort - in production, use a more efficient method
        uint256[] memory sorted = new uint256[](_activeCellIds.length);
        for (uint256 i = 0; i < _activeCellIds.length; i++) {
            sorted[i] = _activeCellIds[i];
        }
        
        // Bubble sort by reputation
        for (uint256 i = 0; i < sorted.length; i++) {
            for (uint256 j = i + 1; j < sorted.length; j++) {
                if (cellReputation[sorted[j]] > cellReputation[sorted[i]]) {
                    uint256 temp = sorted[i];
                    sorted[i] = sorted[j];
                    sorted[j] = temp;
                }
            }
        }
        
        for (uint256 i = 0; i < resultCount; i++) {
            cellIds[i] = sorted[i];
            reputations[i] = cellReputation[sorted[i]];
        }
        
        return (cellIds, reputations);
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Set maximum cell size
     * @param _maxCellSize New maximum size
     */
    function setMaxCellSize(uint256 _maxCellSize) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxCellSize = _maxCellSize;
    }
    
    /**
     * @notice Set formation cooldown
     * @param _formationCooldown New cooldown in seconds
     */
    function setFormationCooldown(uint256 _formationCooldown) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        formationCooldown = _formationCooldown;
    }
    
    /**
     * @notice Manually update cell reputation
     * @param cellId Cell ID
     * @param newReputation New reputation score
     * @param reason Reason for change
     */
    function setCellReputation(
        uint256 cellId,
        uint256 newReputation,
        string calldata reason
    ) external onlyRole(CELL_MANAGER_ROLE) cellExists(cellId) {
        uint256 oldReputation = cellReputation[cellId];
        cellReputation[cellId] = newReputation;
        
        emit ReputationUpdated(cellId, oldReputation, newReputation, reason);
    }

    // ============ Internal Functions ============
    
    function _isMember(uint256 cellId, address player) internal view returns (bool) {
        Cell storage cell = _cells[cellId];
        if (cell.leader == player) return true;
        
        for (uint256 i = 0; i < cell.members.length; i++) {
            if (cell.members[i] == player) return true;
        }
        return false;
    }
    
    function _updateRoleInHistory(address player, uint256 cellId, uint8 newRole) internal {
        PlayerCellHistory[] storage history = _playerHistory[player];
        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].cellId == cellId && history[i].leftAt == 0) {
                history[i].role = newRole;
                break;
            }
        }
    }
    
    function _removeActiveCell(uint256 cellId) internal {
        uint256 index = _cellIdToActiveIndex[cellId];
        uint256 lastIndex = _activeCellIds.length - 1;
        
        if (index != lastIndex) {
            uint256 lastCellId = _activeCellIds[lastIndex];
            _activeCellIds[index] = lastCellId;
            _cellIdToActiveIndex[lastCellId] = index;
        }
        
        _activeCellIds.pop();
        delete _cellIdToActiveIndex[cellId];
    }
    
    function _updateReputation(uint256 cellId, bool won, uint256 score) internal {
        uint256 oldRep = cellReputation[cellId];
        uint256 newRep = oldRep;
        
        if (won) {
            newRep += 10 + (score / 1000);
        } else {
            newRep = newRep > 5 ? newRep - 5 : 0;
        }
        
        cellReputation[cellId] = newRep;
        
        emit ReputationUpdated(cellId, oldRep, newRep, won ? "Battle won" : "Battle lost");
    }
}
