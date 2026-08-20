import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'dtodo537.net',
  description: 'Base tecnica de la plataforma dtodo537.net.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
