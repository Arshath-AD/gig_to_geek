"""
GigToGeek — AI Engine Service

Behavioural micro-savings intelligence layer.
Analyses a user's transaction history and generates
actionable nudges, saving opportunity alerts, and
income-volatility scores.

This is the stub/scaffold. Replace the placeholder logic
with calls to your chosen LLM (OpenAI, Gemini, local Ollama, etc.)
"""

from __future__ import annotations

import statistics
from dataclasses import dataclass, field
from datetime import datetime


# ── Data Contracts ────────────────────────────────────────────

@dataclass
class TransactionSummary:
    """Lightweight DTO passed to the AI engine."""
    id: int
    transaction_type: str     # income | expense | savings
    amount: float
    category: str
    source: str | None
    transaction_date: datetime


@dataclass
class AIInsightPayload:
    """Structured output produced by the AI engine."""
    insight_type: str         # nudge | alert | recommendation
    title: str
    body: str
    confidence_score: float = field(default=0.0)


# ── Engine ────────────────────────────────────────────────────

class AIEngine:
    """
    Behavioural AI engine for GigToGeek.

    Usage::

        engine = AIEngine()
        insights = await engine.generate_insights(user_id=42, transactions=txns)
    """

    # Thresholds (tune via env vars in production)
    VOLATILITY_HIGH_THRESHOLD: float = 0.50    # CV > 50 % → volatile
    MIN_SAVINGS_RATE: float = 0.10             # 10 % of net income

    async def generate_insights(
        self,
        user_id: int,
        transactions: list[TransactionSummary],
    ) -> list[AIInsightPayload]:
        """
        Main entry point. Runs all heuristic analysers and returns
        a ranked list of insights for the user.
        """
        insights: list[AIInsightPayload] = []

        if not transactions:
            insights.append(
                AIInsightPayload(
                    insight_type="nudge",
                    title="Log your first transaction!",
                    body=(
                        "Start by recording your latest gig payment. "
                        "GigToGeek learns your patterns to build smarter "
                        "savings nudges over time."
                    ),
                    confidence_score=1.0,
                )
            )
            return insights

        income_txns = [t for t in transactions if t.transaction_type == "income"]
        expense_txns = [t for t in transactions if t.transaction_type == "expense"]

        insights += self._analyse_income_volatility(income_txns)
        insights += self._analyse_savings_rate(income_txns, expense_txns)
        insights += self._analyse_top_expense_category(expense_txns)

        # Sort by confidence descending
        insights.sort(key=lambda i: i.confidence_score, reverse=True)
        return insights

    # ── Private Analysers ─────────────────────────────────────

    def _analyse_income_volatility(
        self, income_txns: list[TransactionSummary]
    ) -> list[AIInsightPayload]:
        """Flag high income volatility using the coefficient of variation."""
        if len(income_txns) < 3:
            return []

        amounts = [t.amount for t in income_txns]
        mean = statistics.mean(amounts)
        if mean == 0:
            return []

        cv = statistics.stdev(amounts) / mean
        if cv > self.VOLATILITY_HIGH_THRESHOLD:
            return [
                AIInsightPayload(
                    insight_type="alert",
                    title="High income volatility detected",
                    body=(
                        f"Your income varies by {cv * 100:.0f}% on average. "
                        "Consider building a buffer fund equal to 2 months of "
                        "your lowest recorded income to stay resilient."
                    ),
                    confidence_score=min(cv, 1.0),
                )
            ]
        return []

    def _analyse_savings_rate(
        self,
        income_txns: list[TransactionSummary],
        expense_txns: list[TransactionSummary],
    ) -> list[AIInsightPayload]:
        """Recommend a savings action if the savings rate is below target."""
        total_income = sum(t.amount for t in income_txns)
        total_expenses = sum(t.amount for t in expense_txns)
        if total_income == 0:
            return []

        savings_rate = (total_income - total_expenses) / total_income
        if savings_rate < self.MIN_SAVINGS_RATE:
            shortfall = self.MIN_SAVINGS_RATE - savings_rate
            return [
                AIInsightPayload(
                    insight_type="nudge",
                    title="Your savings rate needs a boost",
                    body=(
                        f"You're currently saving {savings_rate * 100:.1f}% of your income. "
                        f"Aim for at least {self.MIN_SAVINGS_RATE * 100:.0f}%. "
                        f"Redirect ₹{total_income * shortfall:,.0f} from discretionary "
                        "spend to hit your target this month."
                    ),
                    confidence_score=0.85,
                )
            ]
        return []

    def _analyse_top_expense_category(
        self, expense_txns: list[TransactionSummary]
    ) -> list[AIInsightPayload]:
        """Identify the single largest spending category."""
        if not expense_txns:
            return []

        category_totals: dict[str, float] = {}
        for t in expense_txns:
            category_totals[t.category] = category_totals.get(t.category, 0) + t.amount

        top_category = max(category_totals, key=lambda c: category_totals[c])
        top_amount = category_totals[top_category]
        total = sum(category_totals.values())
        pct = (top_amount / total) * 100 if total else 0

        return [
            AIInsightPayload(
                insight_type="recommendation",
                title=f"'{top_category}' is your biggest spend",
                body=(
                    f"You've spent {pct:.0f}% of your total expenses on "
                    f"'{top_category}'. Review this category for quick wins — "
                    "even a 10% reduction could meaningfully grow your savings."
                ),
                confidence_score=0.75,
            )
        ]
