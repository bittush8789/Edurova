import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VideoMind AI — Turn Any YouTube Video Into AI-Powered Knowledge",
  description:
    "Paste a YouTube URL and get an AI-generated summary, chapters, key takeaways, and an interactive Q&A. Export your notes as a PDF.",
  keywords: [
    "VideoMind AI",
    "YouTube AI summary",
    "video transcript",
    "AI study notes",
    "YouTube learning",
    "video chapters",
    "PDF export",
  ],
  openGraph: {
    title: "VideoMind AI",
    description: "Turn any YouTube video into AI-powered knowledge — Summarize, Ask, Export.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
