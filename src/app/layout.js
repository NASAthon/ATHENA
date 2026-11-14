import "./globals.css";
import Header from "@/components/Header";
import { CrewProvider } from "@/components/CrewProvider";

export const metadata = {
  title: "ATHENA",
  description: "NASAthon - ATHENA: offline astronaut health monitoring",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <CrewProvider>
          <Header />
          {children}
        </CrewProvider>
      </body>
    </html>
  );
}
