import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "ATHENA",
  description: "NASAthon - ATHENA: offline astronaut health monitoring",
};

export default function RootLayout({ children }) {
  return (
<<<<<<< HEAD:app/layout.js
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
      </body>
=======
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
>>>>>>> 0522eeccbb75a7f1324608c7dfe46f3aa5904865:src/app/layout.js
    </html>
  );
}
