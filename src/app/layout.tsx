import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ben Santana - Portfolio",
  description: "Computer Science Student @ WPI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Inline script to set theme before page loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // First, add a class to prevent transitions during initial load
                document.documentElement.classList.add('disable-transitions');
                
                // Determine theme preference
                let theme;
                try {
                  // Check localStorage first
                  theme = localStorage.getItem('theme');
                  
                  // If no theme in localStorage, check system preference
                  if (!theme) {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = prefersDark ? 'dark' : 'light';
                    localStorage.setItem('theme', theme);
                  }
                } catch (_) {
                  // If localStorage fails, default to dark
                  theme = 'dark';
                }
                
                // Apply theme immediately
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
                
                // Remove transition blocker after a short delay
                window.addEventListener('DOMContentLoaded', function() {
                  setTimeout(function() {
                    document.documentElement.classList.remove('disable-transitions');
                  }, 0);
                });
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
