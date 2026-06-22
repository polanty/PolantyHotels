export function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatMoney(amount, currency = "USD") {
  if (amount === null || amount === undefined) return "Not set";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

export function getUserName(user) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ");
}
