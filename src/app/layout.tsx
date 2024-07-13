import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Regular Expresion to DFA Online Parse Tree Method | Deidr047",
  description: "An app to generate an DFA from an regular expresion Online using the Parse Tree Method",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body  style={{backgroundColor: "#e9e9e9"}}>{children}</body>
    </html>
  );
}
