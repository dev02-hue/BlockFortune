import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Navbar from "./component/layout/Navbar"
import Footer from "./component/layout/Footer"
import LayoutVisibility from "./component/layout/LayoutVisibility"
import FloatingDocButton from "./component/layout/FloatingDocButton"
 import SmartSuppScript from "./component/layout/SmartSuppScript"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Blockfortune | Secure Crypto Investment Platform",
  description:
    "Blockfortune empowers you to grow your wealth through secure, transparent, and high-yield crypto investments. Join our trusted platform and take charge of your financial future.",
  keywords: [
    "Blockfortune",
    "Crypto Investment",
    "Secure Crypto Platform",
    "Passive Income",
    "Blockchain Finance",
    "Invest in Crypto",
    "Web3 Investment",
    "High-Yield Crypto"
  ],
  authors: [{ name: "Blockfortune Team", url: "https://blockfortune.vercel.app" }],
  openGraph: {
    title: "Blockfortune | Secure Crypto Investment Platform",
    description:
      "Grow your wealth through our trusted and transparent crypto investment platform. Start investing with confidence.",
    url: "https://blockfortune.it.com",
    siteName: "Blockfortune",
    images: [
      {
        url: "https://blockfortune.it.com/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Blockfortune crypto investment platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blockfortune | Secure Crypto Investment Platform",
    description:
      "Join Blockfortune and take charge of your financial future with high-yield crypto investments.",
    images: ["https://blockfortune.it.com/opengraph-image.jpg"],
    creator: "@blockfortune",
  },
};

// ... (previous imports remain the same)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <SmartSuppScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LayoutVisibility>
          <Navbar />
        </LayoutVisibility>

        {children}

        <div className="fixed bottom-6 left-6 z-50">
          <FloatingDocButton   />
        </div>

        <LayoutVisibility>
          <Footer />
        </LayoutVisibility>
      </body>
    </html>
  )
}