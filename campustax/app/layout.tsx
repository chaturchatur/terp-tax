import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--ff-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--ff-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--ff-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "TurtleTax — UMD Student Tax Filing",
  description:
    "File federal and Maryland state taxes for free. Built for UMD students — US residents and international F-1/J-1 visa holders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} h-full`}
    >
      <body
        style={{
          fontFamily: "var(--ff-body, DM Sans, sans-serif)",
          background: "var(--cream)",
          color: "var(--ink)",
          fontSize: 15,
          lineHeight: 1.55,
          WebkitFontSmoothing: "antialiased",
          minHeight: "100%",
        }}
      >
        {children}
      </body>
    </html>
  );
}
