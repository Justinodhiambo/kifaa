"""Integration utilities for mobile money disbursements."""
from typing import Any
import requests

API_URL = "https://api.safaricom.co.ke/stkpush"


def send_payment(phone: str, amount: float) -> bool:
    payload = {
        "phoneNumber": phone,
        "amount": amount,
        "accountReference": "KifaaLoan",
        "transactionDesc": "Loan disbursement",
    }
    try:
        resp = requests.post(API_URL, json=payload, timeout=10)
        return resp.status_code == 200
    except requests.RequestException:
        return False
