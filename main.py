import os
import sys
from pathlib import Path

# Add root directory and backend directory to sys.path
_root = Path(__file__).resolve().parent
_backend = _root / "backend"

if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from backend.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
