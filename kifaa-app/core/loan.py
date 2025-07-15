"""Simple loan data structure and repayment logic."""
from dataclasses import dataclass, field
from datetime import date

@dataclass
class Loan:
    user_id: str
    amount: float
    interest_rate: float
    term_months: int
    disbursement_date: date = field(default_factory=date.today)
    status: str = "Active"
    paid_amount: float = 0.0

    @property
    def monthly_installment(self) -> float:
        return round((self.amount * (1 + self.interest_rate)) / self.term_months, 2)

    def make_payment(self, amount: float) -> None:
        """Record a repayment and update loan status."""
        self.paid_amount += amount
        if self.paid_amount >= self.amount * (1 + self.interest_rate):
            self.status = "Paid"
