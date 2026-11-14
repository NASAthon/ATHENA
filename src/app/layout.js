import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "ATHENA",
  description: "NASAthon - ATHENA: offline astronaut health monitoring",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Header />
        {children}
      </body>
    </html>
  );
}