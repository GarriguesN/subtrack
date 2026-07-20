import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import ThemeProvider from "@/components/ThemeProvider";
import PinGate from "@/components/PinGate";

export const metadata: Metadata = {
  title: "SubTrack",
  description: "Track your monthly subscriptions and expenses",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SubTrack",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="256x256" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-dvh flex flex-col">
        <div className="app-container">
          <ThemeProvider>
            <PinGate>
              <NavBar />
              <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                {children}
              </main>
            </PinGate>
          </ThemeProvider>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
