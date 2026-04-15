import { redirect } from "next/navigation";

// Avenues of Service are now statically defined on the frontend.
export default function AdminAvenuesPage() {
  redirect("/admin");
}
