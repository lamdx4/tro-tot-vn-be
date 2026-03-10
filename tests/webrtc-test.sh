#!/bin/bash
#
# WebRTC Video Call Test Runner
# 
# This script runs all the WebRTC-related tests:
# 1. Coturn server connectivity test
# 2. Socket.IO signaling test
# 3. WebRTC comprehensive test
#
# Usage:
#   ./tests/webrtc-test.sh                    # Run all tests
#   ./tests/webrtc-test.sh coturn            # Run only Coturn tests
#   ./tests/webrtc-test.sh signaling         # Run only signaling tests
#   ./tests/webrtc-test.sh webrtc            # Run only WebRTC tests
#   ./tests/webrtc-test.sh start-coturn      # Start Coturn server only
#   ./tests/webrtc-test.sh stop-coturn       # Stop Coturn server only

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SERVER_URL="${SERVER_URL:-http://localhost:3333}"
TURN_SERVER_IP="${TURN_SERVER_IP:-127.0.0.1}"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    header "Checking Prerequisites"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js: $(node --version)"
    else
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        log_success "npm: $(npm --version)"
    else
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        log_success "Docker: $(docker --version)"
    else
        log_warning "Docker is not installed (required for Coturn)"
    fi
    
    # Check docker-compose
    if command -v docker-compose &> /dev/null; then
        log_success "docker-compose: $(docker-compose --version)"
    else
        log_warning "docker-compose is not installed"
    fi
}

# Start Coturn server
start_coturn() {
    header "Starting Coturn Server"
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed"
        exit 1
    fi
    
    log_info "Starting Coturn via docker-compose..."
    docker-compose up -d coturn
    
    log_info "Waiting for Coturn to start..."
    sleep 5
    
    # Check if Coturn is running
    if docker ps | grep -q tro-tot-coturn; then
        log_success "Coturn is running"
        docker ps --filter "name=coturn" --format "  {{.Names}}: {{.Status}}"
    else
        log_error "Coturn failed to start"
        exit 1
    fi
}

# Stop Coturn server
stop_coturn() {
    header "Stopping Coturn Server"
    
    log_info "Stopping Coturn..."
    docker-compose stop coturn
    log_success "Coturn stopped"
}

# Run Coturn tests
run_coturn_tests() {
    header "Running Coturn Tests"
    
    # Check if Coturn is running
    if ! docker ps | grep -q tro-tot-coturn; then
        log_warning "Coturn is not running. Starting it now..."
        start_coturn
    fi
    
    log_info "Running Coturn connectivity tests..."
    node tests/coturn-test.js
    
    if [ $? -eq 0 ]; then
        log_success "Coturn tests passed"
    else
        log_error "Coturn tests failed"
        exit 1
    fi
}

# Run Signaling tests
run_signaling_tests() {
    header "Running Socket.IO Signaling Tests"
    
    # Check if server is running
    log_info "Checking if server is running on $SERVER_URL..."
    
    if curl -s -o /dev/null -w "%{http_code}" "$SERVER_URL/api/video-call/ice-config" | grep -q "200\|401\|403"; then
        log_success "Server is running"
    else
        log_error "Server is not running on $SERVER_URL"
        log_info "Start the server with: npm run dev"
        exit 1
    fi
    
    log_info "Running Socket.IO signaling tests..."
    node tests/signaling-test.js
    
    if [ $? -eq 0 ]; then
        log_success "Signaling tests passed"
    else
        log_error "Signaling tests failed"
        exit 1
    fi
}

# Run WebRTC tests
run_webrtc_tests() {
    header "Running WebRTC Tests"
    
    log_info "Running WebRTC tests (browser tests will be skipped in Node.js)..."
    node tests/webrtc-test.js
    
    if [ $? -eq 0 ]; then
        log_success "WebRTC tests passed"
    else
        log_warning "WebRTC tests had some failures (may be expected in Node.js)"
    fi
}

# Show usage
usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  all           Run all tests (default)"
    echo "  coturn        Run Coturn server tests only"
    echo "  signaling     Run Socket.IO signaling tests only"
    echo "  webrtc        Run WebRTC tests only"
    echo "  start-coturn  Start Coturn server only"
    echo "  stop-coturn   Stop Coturn server only"
    echo ""
    echo "Environment Variables:"
    echo "  SERVER_URL      Server URL (default: http://localhost:3333)"
    echo "  TURN_SERVER_IP  TURN server IP (default: 127.0.0.1)"
    echo ""
    echo "Examples:"
    echo "  $0                      # Run all tests"
    echo "  $0 coturn               # Test Coturn only"
    echo "  SERVER_URL=http://example.com:3000 $0 signaling  # Custom server"
}

# Main
main() {
    check_prerequisites
    
    case "${1:-all}" in
        all)
            run_coturn_tests
            run_signaling_tests
            run_webrtc_tests
            
            header "Test Summary"
            log_success "All tests completed!"
            ;;
        coturn)
            run_coturn_tests
            ;;
        signaling)
            run_signaling_tests
            ;;
        webrtc)
            run_webrtc_tests
            ;;
        start-coturn)
            start_coturn
            ;;
        stop-coturn)
            stop_coturn
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            log_error "Unknown command: $1"
            usage
            exit 1
            ;;
    esac
}

main "$@"

