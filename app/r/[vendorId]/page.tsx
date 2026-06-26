import type { Metadata } from "next";

import IntakeForm from "@/components/intake/IntakeForm";

export const metadata: Metadata = {
  title: "Pay Border Tax",
  description: "Submit your vehicle to pay state border tax.",
};

/**
 * Public customer intake page. The vendor shares /r/{vendorId}; the customer
 * fills the form and the submitBorderTaxRequest callable creates the request
 * (attributed to this vendor). `params` is async in Next 16.
 */
export default async function VendorIntakePage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  return <IntakeForm vendorId={vendorId} />;
}
