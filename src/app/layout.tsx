import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ScrollArea } from "@/components/ui/scroll-area";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Passou",
  description:
    "Currículo que passa na triagem (ATS). Markdown e PDF, sem cadastro. Por rochapontodev.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${geistMono.variable} h-dvh overflow-hidden antialiased dark`}
    >
      <body className="h-dvh overflow-hidden bg-background text-foreground">
        <ScrollArea className="h-dvh w-full" viewportClassName="scroll-smooth">
          {children}
        </ScrollArea>
        <Analytics />
      </body>
    </html>
  );
}
