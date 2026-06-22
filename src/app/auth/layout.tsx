import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Jroyal Grills", default: "Auth | Jroyal Grills" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0A0A",
        backgroundImage: "radial-gradient(ellipse at 60% 20%, rgba(201,168,76,0.04) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(201,168,76,0.03) 0%, transparent 50%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}
