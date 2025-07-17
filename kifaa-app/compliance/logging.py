"""Logging utilities for credit decisions."""
from datetime import datetime
from pathlib import Path
import json

LOG_FILE = Path("credit_decisions.log")


def log_decision(user_id: str, score: float, decision: str) -> None:
    entry = {
        "user_id": user_id,
        "score": score,
        "decision": decision,
        "timestamp": datetime.utcnow().isoformat(),
    }
    with LOG_FILE.open("a") as f:
        f.write(json.dumps(entry) + "\n")
