import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { Toaster } from 'react-hot-toast';
const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body
          className={`${publicSans.variable} antialiased`}
          // style={{ backgroundColor: "#EFF6FF !important" }}
        >
        <SessionProvider>
          {children}
        </SessionProvider>
          <Toaster position="top-right" />
      </body>
    </html>
  );
}
