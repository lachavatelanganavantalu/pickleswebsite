export function buildUpiPayUrl(params: {
  upiId: string;
  payeeName: string;
  amountINR: number;
  note: string;
}): string | null {
  const pa = params.upiId.trim();
  if (!pa || !pa.includes("@")) return null;

  const query = new URLSearchParams({
    pa,
    pn: params.payeeName.slice(0, 50),
    am: params.amountINR.toFixed(2),
    cu: "INR",
    tn: params.note.slice(0, 80),
  });

  return `upi://pay?${query.toString()}`;
}
