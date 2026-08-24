import type { Metadata } from "next";
import OrderTrackingClient from "./OrderTrackingClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Track Order #${id.slice(0, 8).toUpperCase()} – Jroyal Grills`,
        description: "Track your Jroyal Grills order in real-time.",
    };
}

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <OrderTrackingClient orderId={id} />;
}
