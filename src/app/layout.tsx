import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/Provider";
import AuthProvider from "@/components/myComponents/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { LoaderProvider } from "@/components/LoaderContext";
import { Toaster } from "sonner";
import { tr } from "date-fns/locale";
import { ClickSparkWrapper } from "@/components/mage-ui/ClickSparkWrapper";
import { ThemeProvider } from "@/components/Theme_Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "du-be-doos | 2.0",
  description: "A modern todo app with a twist",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession(authOptions)
  return (
    <html lang="en" className=" scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans dark:text-gray-100`}
      >
        {/* auth provider */}
        <AuthProvider session={session}>
          {/* store provider */}
          <Providers>
            {/* loader provider */}
            <LoaderProvider>
              {/* theme provider */}
              <ThemeProvider attribute="class" defaultTheme="light" storageKey="theme" enableSystem={false}>
                {/* cursor click effect */}
                <ClickSparkWrapper >
                  <>
                    {children}
                    <Toaster swipeDirections={["right"]} position="bottom-right" expand duration={3000} className="z-10" toastOptions={{ className: "z-10" }                   } />
                  </>
                </ClickSparkWrapper >
              </ThemeProvider>
            </LoaderProvider>
          </Providers>
        </AuthProvider>

      </body>
    </html>
  );
}
