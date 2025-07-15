"""Simple SMS sending utility."""
import requests

SMS_URL = "https://sms-provider.com/send"


def send_sms(phone: str, message: str) -> bool:
    try:
        response = requests.post(SMS_URL, data={"to": phone, "msg": message}, timeout=10)
        return response.status_code == 200
    except requests.RequestException:
        return False
