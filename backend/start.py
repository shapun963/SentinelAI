#!/usr/bin/env python3
"""
Sentinel AI Backend Startup Script
Handles dependency installation and server startup
"""

import sys
import subprocess
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        logger.error("Python 3.8 or higher is required")
        sys.exit(1)
    logger.info(f"Python version: {sys.version}")


def install_dependencies():
    """Install required dependencies."""
    logger.info("📦 Installing dependencies...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        logger.info("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)


def check_environment():
    """Check environment configuration."""
    env_file = Path(".env")
    if not env_file.exists():
        logger.warning("⚠️ .env file not found. Using environment variables or defaults.")
        logger.info("💡 Create a .env file based on .env.example for custom configuration")
    
    # Check for Gemini API key
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        logger.warning("⚠️ GEMINI_API_KEY not found. Enhanced analysis will be limited.")
        logger.info("💡 Set GEMINI_API_KEY in your .env file for full functionality")


def start_server():
    """Start the FastAPI server."""
    logger.info("🚀 Starting Sentinel AI Backend Server")
    
    try:
        import uvicorn
        from main import app
        
        # Server configuration
        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", 8000))
        debug = os.getenv("DEBUG", "false").lower() == "true"
        
        logger.info(f"🌐 Server will start at: http://{host}:{port}")
        logger.info("📚 API Documentation: http://localhost:8000/docs")
        logger.info("🔍 Health Check: http://localhost:8000/health")
        
        # Start the server
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=debug,
            log_level="info"
        )
        
    except ImportError as e:
        logger.error(f"❌ Missing dependencies: {e}")
        logger.info("🔧 Try running: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        sys.exit(1)


def main():
    """Main startup function."""
    print("🛡️  Sentinel AI Backend - Advanced Content Security Analysis")
    print("=" * 60)
    
    # Change to backend directory
    os.chdir(Path(__file__).parent)
    
    # Run startup checks
    check_python_version()
    
    # Install dependencies if needed
    if not Path("requirements.txt").exists():
        logger.error("❌ requirements.txt not found")
        sys.exit(1)
    
    install_dependencies()
    check_environment()
    
    # Start the server
    start_server()


if __name__ == "__main__":
    main()