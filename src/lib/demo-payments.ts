/** Legacy flag — UPI flow always creates pending orders; demo only affects admin banner. */
export function isDemoPaymentsEnabled(): boolean {
  const flag = process.env.DEMO_PAYMENTS?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  if (flag === "true" || flag === "1" || flag === "yes") return true;
  return process.env.NODE_ENV === "development";
}
