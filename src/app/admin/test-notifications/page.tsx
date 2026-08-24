import type { Metadata } from "next";
import TestNotificationsClient from "./TestNotificationsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Notification Test Suite – Admin | Jroyal Grills",
    description: "Test and verify real-time notifications, push messages, and socket alerts.",
};

export default function TestNotificationsPage() {
    return <TestNotificationsClient />;
}
