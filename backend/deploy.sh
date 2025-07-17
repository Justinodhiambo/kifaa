#!/bin/bash

# Kifaa Deployment Script
# This script handles deployment to various platforms (Render, Fly.io, Heroku, etc.)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"
DOCKER_IMAGE="kifaa"
VERSION=$(date +%Y%m%d-%H%M%S)

# Default values
PLATFORM="render"
ENVIRONMENT="production"
SKIP_TESTS=false
SKIP_BUILD=false
DRY_RUN=false

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    cat << EOF
Kifaa Deployment Script

Usage: $0 [OPTIONS]

Options:
    -p, --platform PLATFORM    Deployment platform (render, fly, heroku, k8s, docker)
    -e, --environment ENV       Environment (development, staging, production)
    -v, --version VERSION       Version tag for deployment
    --skip-tests               Skip running tests before deployment
    --skip-build               Skip building Docker image
    --dry-run                  Show what would be done without executing
    -h, --help                 Show this help message

Platforms:
    render      Deploy to Render.com
    fly         Deploy to Fly.io
    heroku      Deploy to Heroku
    k8s         Deploy to Kubernetes cluster
    docker      Build and run Docker container locally

Examples:
    $0 --platform render --environment production
    $0 --platform fly --version v1.2.3
    $0 --platform docker --environment development
    $0 --dry-run --platform k8s

EOF
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/requirements.txt" ]]; then
        log_error "Not in Kifaa project directory. Please run from project root."
        exit 1
    fi
    
    # Check for required tools based on platform
    case $PLATFORM in
        "render")
            if ! command -v git &> /dev/null; then
                log_error "git is required for Render deployment"
                exit 1
            fi
            ;;
        "fly")
            if ! command -v flyctl &> /dev/null; then
                log_error "flyctl is required for Fly.io deployment. Install from https://fly.io/docs/getting-started/installing-flyctl/"
                exit 1
            fi
            ;;
        "heroku")
            if ! command -v heroku &> /dev/null; then
                log_error "Heroku CLI is required. Install from https://devcenter.heroku.com/articles/heroku-cli"
                exit 1
            fi
            ;;
        "k8s")
            if ! command -v kubectl &> /dev/null; then
                log_error "kubectl is required for Kubernetes deployment"
                exit 1
            fi
            ;;
        "docker")
            if ! command -v docker &> /dev/null; then
                log_error "Docker is required for container deployment"
                exit 1
            fi
            ;;
    esac
    
    log_success "Prerequisites check passed"
}

run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_warning "Skipping tests as requested"
        return 0
    fi
    
    log_info "Running tests..."
    
    cd "$PROJECT_ROOT"
    
    # Install test dependencies if not already installed
    if [[ ! -d "venv" ]]; then
        log_info "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    pip install -r requirements.txt
    
    # Run unit tests
    if ! python -m pytest tests/ -v --tb=short; then
        log_error "Tests failed. Deployment aborted."
        exit 1
    fi
    
    log_success "All tests passed"
}

build_docker_image() {
    if [[ "$SKIP_BUILD" == "true" ]]; then
        log_warning "Skipping Docker build as requested"
        return 0
    fi
    
    log_info "Building Docker image..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would build Docker image with tag: $DOCKER_IMAGE:$VERSION"
        return 0
    fi
    
    # Build the image
    docker build -t "$DOCKER_IMAGE:$VERSION" -t "$DOCKER_IMAGE:latest" .
    
    if [[ $? -eq 0 ]]; then
        log_success "Docker image built successfully"
    else
        log_error "Docker build failed"
        exit 1
    fi
}

deploy_to_render() {
    log_info "Deploying to Render.com..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would deploy to Render via git push"
        return 0
    fi
    
    # Render deploys automatically on git push to main branch
    # Ensure we're on the right branch and push
    
    git add .
    git commit -m "Deploy version $VERSION to $ENVIRONMENT" || true
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        git push origin main
    else
        git push origin develop
    fi
    
    log_success "Deployment triggered on Render. Check your Render dashboard for status."
    log_info "Dashboard: https://dashboard.render.com/"
}

deploy_to_fly() {
    log_info "Deploying to Fly.io..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would run 'flyctl deploy'"
        return 0
    fi
    
    # Deploy using flyctl
    flyctl deploy --app kifaa-$ENVIRONMENT
    
    if [[ $? -eq 0 ]]; then
        log_success "Deployed to Fly.io successfully"
        log_info "App URL: https://kifaa-$ENVIRONMENT.fly.dev"
    else
        log_error "Fly.io deployment failed"
        exit 1
    fi
}

deploy_to_heroku() {
    log_info "Deploying to Heroku..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would deploy to Heroku app kifaa-$ENVIRONMENT"
        return 0
    fi
    
    # Set Heroku app name
    HEROKU_APP="kifaa-$ENVIRONMENT"
    
    # Add Heroku remote if it doesn't exist
    if ! git remote | grep -q heroku; then
        heroku git:remote -a "$HEROKU_APP"
    fi
    
    # Deploy
    git push heroku main
    
    # Run database migrations if needed
    heroku run python app/train_model.py --app "$HEROKU_APP"
    
    log_success "Deployed to Heroku successfully"
    log_info "App URL: https://$HEROKU_APP.herokuapp.com"
}

deploy_to_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would apply Kubernetes manifests"
        return 0
    fi
    
    # Create namespace if it doesn't exist
    kubectl create namespace kifaa-$ENVIRONMENT --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply ConfigMap with environment variables
    kubectl create configmap kifaa-config \
        --from-env-file="$ENV_FILE" \
        --namespace=kifaa-$ENVIRONMENT \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply Kubernetes manifests
    if [[ -d "k8s" ]]; then
        # Update image tag in deployment
        sed "s/{{VERSION}}/$VERSION/g" k8s/deployment.yaml | kubectl apply -f - --namespace=kifaa-$ENVIRONMENT
        kubectl apply -f k8s/ --namespace=kifaa-$ENVIRONMENT
    else
        log_error "Kubernetes manifests not found in k8s/ directory"
        exit 1
    fi
    
    # Wait for deployment to complete
    kubectl rollout status deployment/kifaa --namespace=kifaa-$ENVIRONMENT --timeout=300s
    
    log_success "Deployed to Kubernetes successfully"
    
    # Get service URL
    SERVICE_URL=$(kubectl get service kifaa --namespace=kifaa-$ENVIRONMENT -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [[ -n "$SERVICE_URL" ]]; then
        log_info "Service URL: http://$SERVICE_URL"
    fi
}

deploy_docker_local() {
    log_info "Running Docker container locally..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would run Docker container"
        return 0
    fi
    
    # Stop existing container if running
    docker stop kifaa-$ENVIRONMENT 2>/dev/null || true
    docker rm kifaa-$ENVIRONMENT 2>/dev/null || true
    
    # Run new container
    docker run -d \
        --name kifaa-$ENVIRONMENT \
        --env-file "$ENV_FILE" \
        -p 8000:8000 \
        "$DOCKER_IMAGE:$VERSION"
    
    if [[ $? -eq 0 ]]; then
        log_success "Docker container started successfully"
        log_info "API URL: http://localhost:8000"
        log_info "Health check: http://localhost:8000/health"
        log_info "API docs: http://localhost:8000/docs"
    else
        log_error "Failed to start Docker container"
        exit 1
    fi
}

setup_monitoring() {
    log_info "Setting up monitoring and health checks..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would set up monitoring"
        return 0
    fi
    
    # Wait a moment for the service to start
    sleep 10
    
    # Determine the health check URL based on platform
    case $PLATFORM in
        "render")
            HEALTH_URL="https://kifaa-$ENVIRONMENT.onrender.com/health"
            ;;
        "fly")
            HEALTH_URL="https://kifaa-$ENVIRONMENT.fly.dev/health"
            ;;
        "heroku")
            HEALTH_URL="https://kifaa-$ENVIRONMENT.herokuapp.com/health"
            ;;
        "docker")
            HEALTH_URL="http://localhost:8000/health"
            ;;
        *)
            log_warning "Health check URL not configured for platform: $PLATFORM"
            return 0
            ;;
    esac
    
    # Perform health check
    log_info "Performing health check: $HEALTH_URL"
    
    for i in {1..5}; do
        if curl -f -s "$HEALTH_URL" > /dev/null; then
            log_success "Health check passed"
            return 0
        else
            log_warning "Health check attempt $i failed, retrying in 10 seconds..."
            sleep 10
        fi
    done
    
    log_error "Health check failed after 5 attempts"
    exit 1
}

cleanup() {
    log_info "Cleaning up temporary files..."
    
    # Remove any temporary files created during deployment
    rm -f /tmp/kifaa-deploy-*
    
    log_success "Cleanup completed"
}

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--platform)
                PLATFORM="$2"
                shift 2
                ;;
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -v|--version)
                VERSION="$2"
                shift 2
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Validate platform
    case $PLATFORM in
        "render"|"fly"|"heroku"|"k8s"|"docker")
            ;;
        *)
            log_error "Invalid platform: $PLATFORM"
            show_usage
            exit 1
            ;;
    esac
    
    # Show deployment info
    log_info "Kifaa Deployment Configuration:"
    log_info "  Platform: $PLATFORM"
    log_info "  Environment: $ENVIRONMENT"
    log_info "  Version: $VERSION"
    log_info "  Skip Tests: $SKIP_TESTS"
    log_info "  Skip Build: $SKIP_BUILD"
    log_info "  Dry Run: $DRY_RUN"
    echo
    
    # Trap cleanup on exit
    trap cleanup EXIT
    
    # Execute deployment steps
    check_prerequisites
    run_tests
    
    if [[ "$PLATFORM" != "render" && "$PLATFORM" != "heroku" ]]; then
        build_docker_image
    fi
    
    # Deploy based on platform
    case $PLATFORM in
        "render")
            deploy_to_render
            ;;
        "fly")
            deploy_to_fly
            ;;
        "heroku")
            deploy_to_heroku
            ;;
        "k8s")
            deploy_to_kubernetes
            ;;
        "docker")
            deploy_docker_local
            ;;
    esac
    
    setup_monitoring
    
    log_success "Deployment completed successfully!"
    log_info "Version $VERSION deployed to $PLATFORM ($ENVIRONMENT)"
}

# Run main function
main "$@"

