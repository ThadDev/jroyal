import type { Metadata } from "next";
import DriversManagementClient from "./DriversManagementClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Driver Management – Admin | Jroyal Grills",
    description: "Manage delivery drivers and riders for Jroyal Grills.",
};

export default function AdminDriversPage() {
    return <DriversManagementClient />;
}
