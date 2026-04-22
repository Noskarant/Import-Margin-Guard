import '@/styles/globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Import Margin Guard',
  description: 'Upload, map, compare import scenarios, and protect margin.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
