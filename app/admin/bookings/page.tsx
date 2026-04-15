import { redirect } from "next/navigation";

// Operations module has been removed.
export default function AdminBookingsPage() {
  redirect("/admin");
}
