// src/utils/currency.ts
// Single source of truth for currency formatting across the app. Values are
// stored as plain numbers (LKR) — this is the only place that adds the
// "LKR" label, so changing currency later is a one-line change.

export function formatCurrency(amount: number): string {
  return `LKR ${amount.toLocaleString()}`;
}

export function formatMonthlyRent(amount: number): string {
  return `${formatCurrency(amount)}/mo`;
}
