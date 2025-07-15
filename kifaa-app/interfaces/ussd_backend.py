"""Minimal USSD backend using Flask."""
from flask import Flask, request

app = Flask(__name__)

@app.route('/ussd', methods=['POST'])
def ussd_callback():
    session_id = request.values.get("sessionId")
    phone = request.values.get("phoneNumber")
    text = request.values.get("text", "")

    if text == "":
        response = "CON Welcome to Kifaa. 1. Apply for Loan 2. Check Balance"
    elif text == "1":
        response = "CON Enter Loan Amount:"
    else:
        response = "END Invalid choice"

    return f"Content-Type: text/plain\n\n{response}"

if __name__ == '__main__':
    app.run()
