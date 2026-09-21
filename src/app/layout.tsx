import type { Metadata } from 'next';
import './globals.css';
import { ClientNavbar } from '@/components/ClientNavbar';

export const metadata: Metadata = {
  title: 'PrepPilot AI - Personalised AI Interview Prep Kits',
  description: 'Turn job descriptions into tailored interview preparation kits, questions, flashcards and study schedules.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <ClientNavbar />
        <main className="flex-1 w-full relative">
          {children}
        </main>

        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          PrepPilot AI — Personalised AI Interview Preparation Kit Engine
        </footer>
      </body>
    </html>
  );
}
