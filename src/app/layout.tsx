import "@/app/globals.css";
import { Toaster } from "@/ui/toaster";

export const metadata = {
  title: "✨ SigSend",
  description:
    "Request crypto signatures from your friends, colleagues, and peers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@hexcowboy" />
        <meta name="twitter:creator" content="@hexcowboy" />
        <meta name="twitter:title" content="SigSend" />
        <meta
          name="twitter:description"
          content="Request crypto signatures from your friends, colleagues, and peers."
        />
        <meta
          name="twitter:image"
          content="https://r2.sigsend.xyz/twitter-card.webp"
        />
      </head>
      <body className="bg-white font-sans text-black dark:bg-black dark:text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
