import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

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
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-brand-700 transition-colors">
                P
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                PrepPilot
              </span>
            </Link>

            <nav className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all"
              >
                Login
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          PrepPilot AI — Personalised AI Interview Preparation Kit Engine
        </footer>
      </body>
    </html>
  );
}
