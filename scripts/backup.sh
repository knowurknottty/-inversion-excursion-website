#!/bin/bash
#
# Database Backup Script for Supabase
# Runs daily via GitHub Actions or cron
#

set -e

# Configuration
PROJECT_REF="${SUPABASE_PROJECT_REF}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup-${TIMESTAMP}.sql"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        log_error "SUPABASE_ACCESS_TOKEN is not set"
        exit 1
    fi

    if [ -z "$PROJECT_REF" ]; then
        log_error "SUPABASE_PROJECT_REF is not set"
        exit 1
    fi

    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI is not installed"
        exit 1
    fi
}

# Create backup directory
setup() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Create backup
backup() {
    log_info "Starting database backup..."
    log_info "Project: $PROJECT_REF"
    log_info "Output: $BACKUP_FILE"

    # Link to project
    supabase link --project-ref "$PROJECT_REF"

    # Dump database
    supabase db dump > "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        log_info "Backup completed successfully"
        log_info "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
    else
        log_error "Backup failed"
        exit 1
    fi
}

# Compress backup
compress() {
    log_info "Compressing backup..."
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    log_info "Compressed size: $(du -h "$BACKUP_FILE" | cut -f1)"
}

# Upload to storage (optional)
upload() {
    if [ -n "$STORAGE_BUCKET" ]; then
        log_info "Uploading to storage bucket: $STORAGE_BUCKET"
        
        # Example: Upload to S3
        if command -v aws &> /dev/null; then
            aws s3 cp "$BACKUP_FILE" "s3://${STORAGE_BUCKET}/backups/"
            log_info "Upload complete"
        else
            log_warn "AWS CLI not found, skipping upload"
        fi
    fi
}

# Clean old backups
cleanup() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_DIR" -name "backup-*.sql*" -mtime +$RETENTION_DAYS -delete
    
    log_info "Cleanup complete"
}

# Verify backup
verify() {
    log_info "Verifying backup integrity..."
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "Backup file not found"
        exit 1
    fi

    if [ ! -s "$BACKUP_FILE" ]; then
        log_error "Backup file is empty"
        exit 1
    fi

    log_info "Backup verification passed"
}

# Main
main() {
    echo "=========================================="
    echo "  Database Backup Script"
    echo "=========================================="
    echo ""

    check_prerequisites
    setup
    backup
    compress
    verify
    upload
    cleanup

    echo ""
    log_info "Backup process completed successfully!"
    log_info "Backup location: $BACKUP_FILE"
}

# Help
show_help() {
    echo "Database Backup Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Environment Variables:"
    echo "  SUPABASE_ACCESS_TOKEN    Supabase access token (required)"
    echo "  SUPABASE_PROJECT_REF     Project reference ID (required)"
    echo "  BACKUP_DIR              Backup directory (default: ./backups)"
    echo "  RETENTION_DAYS          Days to keep backups (default: 30)"
    echo "  STORAGE_BUCKET          S3 bucket for offsite storage (optional)"
    echo ""
    echo "Examples:"
    echo "  SUPABASE_ACCESS_TOKEN=xxx SUPABASE_PROJECT_REF=yyy $0"
    echo "  BACKUP_DIR=/data/backups RETENTION_DAYS=7 $0"
}

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

main
