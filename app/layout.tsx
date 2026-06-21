import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RevOps Dashboard | CoinGecko",
  description: "Revenue Operations Command Center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0D1117] text-[#E6EDF3] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
