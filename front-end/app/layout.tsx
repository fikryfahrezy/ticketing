import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppToaster } from "@/components/ui/sonner";
import { NewTicketDialog } from "@/components/ticket/new-ticket-dialog";
import { LayoutDashboard } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Support Hub",
  description: "Triage & Recovery System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <div className="bg-background flex h-screen flex-col overflow-hidden font-sans">
          <header className="bg-secondary text-secondary-foreground z-10 flex shrink-0 flex-col justify-between gap-4 border-b border-white/10 px-6 py-4 shadow-md md:flex-row">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary rounded-md p-2">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg leading-none font-bold">
                    Agent Dashboard
                  </h1>
                  <p className="text-xs font-light text-gray-300">
                    AI Triage Hub
                  </p>
                </div>
              </div>
            </div>

            <NewTicketDialog />
          </header>
          {children}
        </div>

        <AppToaster />
      </body>
    </html>
  );
}
