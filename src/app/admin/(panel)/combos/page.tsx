import { redirect } from "next/navigation";

export default function AdminCombosRedirectPage() {
  redirect("/admin/products");
}
