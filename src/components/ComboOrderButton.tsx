"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { loginUrl } from "@/lib/customer-login-url";
import type { ComboPack } from "@/data/combos";

interface Props {
  combo: ComboPack;
}

export default function ComboOrderButton({ combo }: Props) {
  const { addItem } = useCart();
  const { user } = useCustomerAuth();
  const router = useRouter();

  const handleAdd = () => {
    addItem({
      productId: combo.id,
      productName: combo.nameTelugu ?? combo.name,
      variantId: "combo",
      variantLabel: "5 jars · 250g each",
      priceINR: combo.priceINR,
    });
    router.push(user ? "/checkout" : loginUrl("/checkout"));
  };

  return (
    <button type="button" onClick={handleAdd} className="shop-select-btn mt-5">
      ORDER THIS COMBO
    </button>
  );
}
