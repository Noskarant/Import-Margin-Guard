import type { ReactNode } from 'react';

export const metadata = {
  title: 'Import Margin Guard',
  description: 'Upload, map, compare import scenarios, and protect margin.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, background: '#f7f7f7', color: '#111827' }}>
        {children}
      </body>
    </html>
  );
}
