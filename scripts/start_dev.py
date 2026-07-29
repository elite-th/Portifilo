#!/usr/bin/env python3
"""
Start the Next.js dev server as a fully-detached daemon.

Uses the classic Unix double-fork daemonization pattern so the process
is reparented to PID 1 (init) and cannot receive SIGHUP from any shell.

Usage:
    python3 scripts/start_dev.py          # start
    python3 scripts/start_dev.py stop     # stop
    python3 scripts/start_dev.py status   # check
"""

import os
import sys
import signal
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOG_FILE = PROJECT_ROOT / "dev.log"
PID_FILE = PROJECT_ROOT / ".dev.pid"
PORT = 3000


def is_running() -> int | None:
    """Return the PID of the running next-server process, or None."""
    try:
        with open(PID_FILE) as f:
            pid = int(f.read().strip())
        os.kill(pid, 0)  # signal 0 = check existence
        return pid
    except (FileNotFoundError, ValueError, ProcessLookupError, PermissionError):
        return None


def stop() -> None:
    pid = is_running()
    if pid is None:
        print("Server is not running.")
        return
    try:
        os.kill(pid, signal.SIGTERM)
        time.sleep(2)
        if is_running():
            os.kill(pid, signal.SIGKILL)
        print(f"Stopped server (PID {pid}).")
    except ProcessLookupError:
        print("Process already gone.")
    finally:
        try:
            PID_FILE.unlink()
        except FileNotFoundError:
            pass


def start() -> None:
    if is_running() is not None:
        print(f"Server already running (PID {is_running()}).")
        return

    log_fd = os.open(str(LOG_FILE), os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)

    # ----- Double-fork daemonization -----
    # 1st fork: parent exits, child continues
    pid = os.fork()
    if pid > 0:
        # Parent waits briefly for the grandchild to write its PID
        time.sleep(2)
        try:
            with open(PID_FILE) as f:
                print(f"Started server (PID {f.read().strip()}).")
        except FileNotFoundError:
            print("Failed to start — check dev.log")
        return

    # 2nd: become session leader (detach from controlling terminal)
    os.setsid()
    os.umask(0)

    # 3rd fork: child becomes orphan, reparented to init (PID 1)
    pid = os.fork()
    if pid > 0:
        # Write the grandchild PID before exiting
        with open(PID_FILE, "w") as f:
            f.write(str(pid))
        os._exit(0)

    # ----- Grandchild (the daemon) -----
    # Redirect stdio to the log file
    os.dup2(log_fd, 0)  # stdin
    os.dup2(log_fd, 1)  # stdout
    os.dup2(log_fd, 2)  # stderr
    os.close(log_fd)

    # Set environment
    env = os.environ.copy()
    env["PORT"] = str(PORT)

    # exec replaces this process image — no fork leftovers
    os.chdir(str(PROJECT_ROOT))
    os.execvpe("bun", ["bun", "run", "dev"], env)


def status() -> None:
    pid = is_running()
    if pid is None:
        print("Server is not running.")
        sys.exit(1)
    print(f"Server running (PID {pid}).")
    # Quick health check
    import urllib.request
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{PORT}", timeout=3) as r:
            print(f"HTTP response: {r.status}")
    except Exception as e:
        print(f"Health check failed: {e}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "start"
    if cmd == "start":
        start()
    elif cmd == "stop":
        stop()
    elif cmd in ("status", "check"):
        status()
    elif cmd == "restart":
        stop()
        time.sleep(1)
        start()
    else:
        print(f"Usage: {sys.argv[0]} [start|stop|restart|status]")
        sys.exit(1)
