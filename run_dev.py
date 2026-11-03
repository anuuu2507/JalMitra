import subprocess
import sys
import time
import os
import signal

def main():
    print("==================================================================")
    print(" JalMitra — Smart Community Water Availability and Alert System")
    print(" Seva First Innovation Challenge 2026")
    print("==================================================================")
    print("\n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...")

    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=os.path.dirname(os.path.abspath(__file__))
    )

    time.sleep(2)

    print("\n[2/2] Starting Vite Frontend on http://localhost:5173 ...")
    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")
    frontend_proc = subprocess.Popen(
        "npm run dev",
        cwd=frontend_dir,
        shell=True
    )

    print("\n[SUCCESS] JalMitra is live!")
    print("  - Frontend UI:  http://localhost:5173")
    print("  - Backend API:  http://127.0.0.1:8000/docs")
    print("\nPress Ctrl+C to terminate both servers.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping JalMitra servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
