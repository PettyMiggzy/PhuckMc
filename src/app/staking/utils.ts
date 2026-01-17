export function formatToken(
  value?: bigint,
  decimals = 18,
  precision = 4
) {
  if (!value) return "0";
  const num = Number(value) / 10 ** decimals;
  return num.toLocaleString(undefined, {
    maximumFractionDigits: precision,
  });
}
