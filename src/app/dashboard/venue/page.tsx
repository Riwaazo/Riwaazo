import { redirect } from "next/navigation";

export default function VenueDashboardRedirect() {
  redirect("/dashboard/venues");
}
