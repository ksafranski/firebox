import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { Providers } from "./providers";
import { HeaderBar } from "./blox/header/HeaderBar";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

export const metadata: Metadata = {
  title: "FireBlox",
  description: "All sorts of blox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${urbanist.variable} antialiased`}
        style={{ background: "transparent" }}
      >
        <Providers>
          <HeaderBar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
