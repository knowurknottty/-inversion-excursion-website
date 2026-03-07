#!/bin/bash
#
# Deployment script for The Inversion Excursion
# Usage: ./deploy.sh [network]
# Networks: local, testnet (baseSepolia), mainnet (base)
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default network
NETWORK=${1:-"testnet"}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate network
validate_network() {
    case $NETWORK in
        local|hardhat|localhost)
            NETWORK="hardhat"
            RPC_URL="${BASE_RPC_URL:-http://localhost:8545}"
            ;;
        testnet|baseSepolia|sepolia)
            NETWORK="baseSepolia"
            RPC_URL="${BASE_SEPOLIA_RPC_URL:-https://sepolia.base.org}"
            ;;
        mainnet|base)
            NETWORK="base"
            RPC_URL="${BASE_RPC_URL:-https://mainnet.base.org}"
            ;;
        *)
            log_error "Invalid network: $NETWORK"
            echo "Valid networks: local, testnet (baseSepolia), mainnet (base)"
            exit 1
            ;;
    esac
}

# Check environment
check_env() {
    log_info "Checking environment..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check private key
    if [ -z "$PRIVATE_KEY" ]; then
        log_error "PRIVATE_KEY environment variable not set"
        exit 1
    fi
    
    # Check RPC URL
    if [ -z "$RPC_URL" ]; then
        log_error "RPC URL not configured for network: $NETWORK"
        exit 1
    fi
    
    log_success "Environment check passed"
}

# Install dependencies
install_deps() {
    log_info "Installing dependencies..."
    cd "$PROJECT_ROOT"
    npm ci
    log_success "Dependencies installed"
}

# Compile contracts
compile() {
    log_info "Compiling contracts..."
    cd "$PROJECT_ROOT"
    npm run compile
    log_success "Contracts compiled"
}

# Run tests
run_tests() {
    log_info "Running contract tests..."
    cd "$PROJECT_ROOT"
    npm test
    log_success "Tests passed"
}

# Estimate gas
gas_estimate() {
    log_info "Estimating gas costs..."
    cd "$PROJECT_ROOT"
    REPORT_GAS=true npm run compile
    log_info "Gas estimates complete (see compilation output above)"
}

# Deploy contracts
deploy() {
    log_info "Deploying to $NETWORK..."
    log_info "RPC URL: $RPC_URL"
    
    cd "$PROJECT_ROOT"
    
    # Run deployment script
    npx hardhat run scripts/deploy.js --network "$NETWORK"
    
    log_success "Deployment complete!"
}

# Verify contracts
verify() {
    if [ "$NETWORK" = "hardhat" ]; then
        log_warn "Skipping verification for local network"
        return
    fi
    
    if [ -z "$BASESCAN_API_KEY" ]; then
        log_warn "BASESCAN_API_KEY not set, skipping verification"
        return
    fi
    
    log_info "Verifying contracts on Basescan..."
    cd "$PROJECT_ROOT"
    npx hardhat verify --network "$NETWORK"
    log_success "Verification complete!"
}

# Update frontend environment
update_frontend() {
    log_info "Updating frontend environment variables..."
    
    DEPLOYMENT_FILE="$PROJECT_ROOT/deployments/$NETWORK/latest.json"
    
    if [ ! -f "$DEPLOYMENT_FILE" ]; then
        log_warn "Deployment file not found: $DEPLOYMENT_FILE"
        return
    fi
    
    # Extract contract addresses
    BATTLEGROUND=$(jq -r '.contracts.Battleground // empty' "$DEPLOYMENT_FILE")
    CELL_REGISTRY=$(jq -r '.contracts.CellRegistry // empty' "$DEPLOYMENT_FILE")
    CATALYST=$(jq -r '.contracts.FrequencyCatalyst // empty' "$DEPLOYMENT_FILE")
    CARDS=$(jq -r '.contracts.InversionCard // empty' "$DEPLOYMENT_FILE")
    KEEPER=$(jq -r '.contracts.ResonanceKeeper // empty' "$DEPLOYMENT_FILE")
    
    # Create/update .env.local for frontend
    ENV_FILE="$PROJECT_ROOT/.env.local"
    
    cat > "$ENV_FILE" << EOF
# Auto-generated from deployment on $(date)
NEXT_PUBLIC_NETWORK=$NETWORK
NEXT_PUBLIC_CHAIN_ID=$(jq -r '.chainId' "$DEPLOYMENT_FILE")
NEXT_PUBLIC_RPC_URL=$RPC_URL

# Contract Addresses
NEXT_PUBLIC_CONTRACT_BATTLEGROUND=$BATTLEGROUND
NEXT_PUBLIC_CONTRACT_CELL_REGISTRY=$CELL_REGISTRY
NEXT_PUBLIC_CONTRACT_FREQUENCY_CATALYST=$CATALYST
NEXT_PUBLIC_CONTRACT_INVERSION_CARD=$CARDS
NEXT_PUBLIC_CONTRACT_RESONANCE_KEEPER=$KEEPER
EOF
    
    log_success "Frontend environment updated: $ENV_FILE"
}

# Main execution
main() {
    echo "=========================================="
    echo "  Inversion Excursion Deployment Script"
    echo "=========================================="
    echo ""
    
    validate_network
    check_env
    install_deps
    compile
    
    # Ask for confirmation on mainnet
    if [ "$NETWORK" = "base" ]; then
        log_warn "⚠️  You are about to deploy to MAINNET"
        log_warn "This will cost real ETH on Base"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    fi
    
    # Optional: Run tests before deployment
    if [ "$NETWORK" != "hardhat" ]; then
        read -p "Run tests before deployment? (y/n): " run_tests_confirm
        if [ "$run_tests_confirm" = "y" ]; then
            run_tests
        fi
    fi
    
    # Optional: Gas estimate
    read -p "Estimate gas costs? (y/n): " gas_confirm
    if [ "$gas_confirm" = "y" ]; then
        gas_estimate
    fi
    
    # Deploy
    deploy
    
    # Verify
    read -p "Verify contracts on Basescan? (y/n): " verify_confirm
    if [ "$verify_confirm" = "y" ]; then
        verify
    fi
    
    # Update frontend
    update_frontend
    
    echo ""
    log_success "All done! 🎉"
    echo ""
    echo "Next steps:"
    echo "  1. Check deployments/$NETWORK/latest.json for contract addresses"
    echo "  2. Update Vercel environment variables if needed"
    echo "  3. Test the deployment on ${NETWORK}"
}

# Show help
show_help() {
    echo "Inversion Excursion Deployment Script"
    echo ""
    echo "Usage: $0 [network] [options]"
    echo ""
    echo "Networks:"
    echo "  local, hardhat    Deploy to local Hardhat network"
    echo "  testnet, sepolia  Deploy to Base Sepolia testnet"
    echo "  mainnet, base     Deploy to Base mainnet"
    echo ""
    echo "Environment Variables:"
    echo "  PRIVATE_KEY         Required - Deployer private key"
    echo "  BASE_RPC_URL        Required for mainnet - Base mainnet RPC"
    echo "  BASE_SEPOLIA_RPC_URL Required for testnet - Base Sepolia RPC"
    echo "  BASESCAN_API_KEY    Optional - For contract verification"
    echo ""
    echo "Examples:"
    echo "  $0 testnet              Deploy to testnet"
    echo "  $0 mainnet              Deploy to mainnet (with confirmation)"
    echo "  PRIVATE_KEY=0x... $0    Deploy with explicit key"
}

# Handle help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# Run main
main
