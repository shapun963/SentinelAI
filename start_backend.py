#!/usr/bin/env python3
"""
Start the Sentinel AI Python Backend
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """Start the Python backend server."""
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    # Set environment variables
    os.environ["HOST"] = "0.0.0.0"
    os.environ["PORT"] = "5000"  # Use the same port as the old backend
    
    print("🚀 Starting Sentinel AI Python Backend on port 5000...")
    
    # Start the server
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "simple_main:app", 
            "--host", "0.0.0.0", 
            "--port", "5000",
            "--reload"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start backend: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n🔄 Shutting down backend...")

if __name__ == "__main__":
    main()