import "./globals.css";
import Header from "@/components/Header";
import { CrewProvider } from "@/components/CrewProvider";
import { MissionDataProvider } from "@/components/MissionDataProvider";
import { MissionModeProvider } from "@/components/MissionModeProvider";

export const metadata = {
  title: "ATHENA",
  description: "NASAthon - ATHENA: offline astronaut health monitoring",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <MissionDataProvider>
          <CrewProvider>
            <MissionModeProvider>
              <Header />
              {children}
            </MissionModeProvider>
          </CrewProvider>
        </MissionDataProvider>
      </body>
    </html>
  );
}
