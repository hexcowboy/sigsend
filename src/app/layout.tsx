import "./globals.css";

export const metadata = {
  title: "SigSend",
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
      <body className="bg-white font-sans text-black dark:bg-black dark:text-white">
        {children}
      </body>
    </html>
  );
}
