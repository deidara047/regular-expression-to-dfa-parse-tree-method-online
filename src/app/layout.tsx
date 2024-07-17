import type { Metadata } from "next";
import "./globals.css";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Regular Expression to DFA Online Parse Tree Method | Deidr047",
  description: "An app to generate a DFA from a regular expression online using the Parse Tree Method",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta name="robots" content="all" />
      </Head>
      <body style={{backgroundColor: "#e9e9e9"}}>{children}</body>
    </html>
  );
}
