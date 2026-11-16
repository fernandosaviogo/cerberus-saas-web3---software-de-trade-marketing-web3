import type { Metadata } from "next";
import "../styles/globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../styles/tailwind.css"

export const metadata: Metadata = {
  title: "Cerberus Platform",
  description: "Web3 Bot trading platform"
};

export default function RootLayout({ 
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href="/img/band/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/img/brand/apple-icon.png"
        />
        <link type="text/css" href="/css/notyf.min.css" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body suppressHydrationWarning className="text-blueGray-700 antialiased">
        {children}
        <script type="text/javascript" src="/js/notyf.min.js" ></script>
      </body>
    </html>
  );
}
