import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";

const poppins = Poppins( { 
  subsets  : ["latin"], 
  weight   : ["300", "400", "500", "600", "700"],
  variable : "--font-poppins",
} );

export const metadata: Metadata = {
  title       : "BRILink Admin System",
  description : "Manage transactions and fees dynamically",
};

export default function RootLayout( {
  children,
}: Readonly<{
  children: React.ReactNode;
}> ) {
  return (
    <html lang="en"
      suppressHydrationWarning
    >
      <body className={`${poppins.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <NextTopLoader color="#2563eb"
            showSpinner={false}
          />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
