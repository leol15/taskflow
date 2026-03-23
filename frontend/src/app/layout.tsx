import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.scss";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow | Sleek Task Management",
  description: "Capture, Organize, Prioritize.",
};

import { TaskProvider } from "../context/TaskContext";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AuthProvider>
          <TaskProvider>{children}</TaskProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
