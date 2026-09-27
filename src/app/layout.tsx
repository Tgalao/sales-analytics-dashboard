import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sales Analytics Dashboard",
  description: "Revenue, orders, products and customer analytics for a fictional online store.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
