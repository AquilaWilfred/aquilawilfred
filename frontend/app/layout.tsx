import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Aquila | Amon Aquila Wilfred – AI/ML · Full Stack · Data Science",
  description: "Portfolio of Amon Aquila Wilfred. Data Scientist, AI/ML Specialist, Full Stack Engineer & Founder of XcognVis.Com.",
  icons: {
    icon: [
      { url: "/aquiladp.svg", type: "image/svg+xml" },
      { url: "/aquiladp.ico", type: "image/x-icon" },
    ],
    shortcut: "/aquiladp.ico",
    apple: "/aquiladp.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/aquiladp.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/aquiladp.ico" />
      </head>
      <body className="antialiased" style={{ background: "#F0F9FF", color: "#082F49" }}>
        {children}
        <Toaster position="top-right" toastOptions={{
          style: { background: "white", color: "#082F49", border: "1px solid rgba(14,165,233,0.3)", boxShadow: "0 4px 20px rgba(12,74,110,0.15)" },
        }} />
      </body>
    </html>
  );
}
