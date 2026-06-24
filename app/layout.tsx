import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Driver Panel",
  description: "Border tax automation — operator driver panel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Fonts loaded identically to the source project so the literal
            'Poppins' / 'JetBrains Mono' family names used throughout the
            inline styles resolve exactly as before. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* Intentional: the source loads these exact families by name via a
            stylesheet link; next/font would rename them and break the literal
            'Poppins' / 'JetBrains Mono' references in the inline styles. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
