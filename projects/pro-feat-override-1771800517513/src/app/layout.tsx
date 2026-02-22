import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WADI Generated App",
  description: "Created with WADI Constructor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}