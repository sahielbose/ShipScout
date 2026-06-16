import type { Metadata } from "next";
import { Playground } from "@/components/public/Playground";

// Public playground (CONTEXT.md section 3.12).
export const metadata: Metadata = {
  title: "ShipScout Playground - map the top engineers in a domain",
  description:
    "Explore the top open-source engineers in a domain, ranked by evidence. Backed by the ShipScout seeded dataset.",
};

export default function PlaygroundPage() {
  return <Playground />;
}
