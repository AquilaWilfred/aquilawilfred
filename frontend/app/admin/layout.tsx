import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Aquila Admin Portal",
  description: "Secure Portfolio Management Dashboard",
};

// Completely standalone — no Navbar, no Footer, no main site chrome
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", background: "#070F1F" }}>
      {children}
    </div>
  );
}
