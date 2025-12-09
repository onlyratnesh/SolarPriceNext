export const formatCurrency = (value?: number | null) => {
  const num = typeof value === "number" && !isNaN(value) ? value : 0;
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};