import type { Metadata } from "next";
import OrderClient from "./OrderClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Complete Order – Jroyal Grills",
};

export default function OrderPage() {
    return <OrderClient />;
}
