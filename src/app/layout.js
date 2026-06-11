import "./globals.css";

export const metadata = {
  title: "Tap Protocol",
  description: "A monster-tapping idle game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
