"""User entity used for loan and wallet tracking."""
from dataclasses import dataclass, field
from typing import List
from .loan import Loan

@dataclass
class User:
    id: str
    name: str
    phone: str
    loans: List[Loan] = field(default_factory=list)

    def apply_for_loan(self, amount: float, interest: float, term: int) -> Loan:
        loan = Loan(user_id=self.id, amount=amount, interest_rate=interest, term_months=term)
        self.loans.append(loan)
        return loan
