import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyRecipes - ספר מתכונים",
  description: "ספר מתכונים משפחתי - ספריית מתכונים ניתנת לחיפוש",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700&family=Heebo:wght@300;400;500;600;700&family=Alef:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
