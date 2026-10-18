import type { Metadata } from "next";
import OrdersClient from "@/components/dashboard/OrdersClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Orders – Jroyal Grills" };

export default function UserOrdersPage() {
    return <OrdersClient />;
}
