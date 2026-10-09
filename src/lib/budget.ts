export type BudgetInputs = { takeHome: number; rent: number; peopleSharing: number; groceries: number; transport: number; utilities: number; debt: number; other: number; savings: number };
export function calculateBudget(input: BudgetInputs) {
  const value = (number: number) => Number.isFinite(number) ? Math.max(0, number) : 0;
  const takeHome = value(input.takeHome);
  const rent = value(input.rent) / Math.max(1, Math.floor(value(input.peopleSharing)));
  const expenses = [
    { label: "Your share of rent", value: rent },
    { label: "Groceries", value: value(input.groceries) },
    { label: "Transport", value: value(input.transport) },
    { label: "Utilities & internet", value: value(input.utilities) },
    { label: "Debt payments", value: value(input.debt) },
    { label: "Other essentials", value: value(input.other) },
    { label: "Savings goal", value: value(input.savings) },
  ];
  const total = expenses.reduce((sum, expense) => sum + expense.value, 0);
  return { takeHome, rent, expenses, total, remaining: takeHome - total, rentShare: takeHome > 0 ? rent / takeHome * 100 : null };
}
