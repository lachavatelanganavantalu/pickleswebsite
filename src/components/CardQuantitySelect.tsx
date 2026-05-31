"use client";

const MAX_QTY = 10;

interface Props {
  value: number;
  onChange: (qty: number) => void;
  id?: string;
}

export default function CardQuantitySelect({ value, onChange, id }: Props) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="shop-card-qty-select"
      aria-label="Quantity"
    >
      {Array.from({ length: MAX_QTY }, (_, i) => i + 1).map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );
}
