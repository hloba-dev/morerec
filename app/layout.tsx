import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Генератор реквизитов',
  description: 'Формирование и сохранение платёжных реквизитов',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Реквизиты',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // viewport-fit=cover -> корректные safe-area отступы на iPhone с «чёлкой».
  viewportFit: 'cover',
  themeColor: '#0073aa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
