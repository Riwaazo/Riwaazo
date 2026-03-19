import { redirect } from "next/navigation";

type VendorParams = { vendorId: string };

export default async function VendorSingularRedirect({ params }: { params: Promise<VendorParams> }) {
  const { vendorId } = await params;
  redirect(`/vendors/${vendorId}`);
}
