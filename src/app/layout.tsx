import type { Metadata } from 'next';
import './globals.css';
import ScrollEffects from '@/components/ScrollEffects';

export const metadata: Metadata = {
  title: 'Kementerian Minat dan Bakat — BEM FT Unsoed',
  description:
    'Kementerian Minat dan Bakat BEM FT Unsoed, Kabinet Sagara Cakrawala — wadah program kerja, agenda kerja, delegasi lomba, dan peminjaman alat bagi KBMFT di bidang olahraga dan seni.',
  icons: {
    icon: '/assets/Mikat Logo Preview 1.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <div className="scroll-progress" id="scrollProgress"></div>
        <ScrollEffects />
        {children}
      </body>
    </html>
  );
}
