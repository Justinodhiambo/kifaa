"""Example entrypoint combining modules for demonstration purposes."""
from ai_model import train_model
from compliance.logging import log_decision
from core.user import User
from integrations.mobile_money import send_payment


def main() -> None:
    # Train or load the model and get some sample data
    model, X_test = train_model.train()

    user = User(id="1", name="Jane", phone="+254700000000")
    score = model.predict_proba(X_test)[:, 1][0]
    decision = "approve" if score > 0.5 else "reject"
    log_decision(user.id, float(score), decision)

    if decision == "approve":
        send_payment(user.phone, 1000)


if __name__ == "__main__":
    main()
