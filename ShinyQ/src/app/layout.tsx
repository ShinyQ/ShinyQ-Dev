import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import ScatteredIcons from '@/components/layouts/ScatteredIcons';
import { ThemeProvider } from 'next-themes';
import { colorPalettes } from '@/data/colorPalettes';
import { trackUniqueVisitor } from '@/lib/uniqueVisitor';
import { headers } from 'next/headers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'Kurniadi Ahmad Wijaya',
  description: 'Backend and Full-stack Developer with expertise in microservices, API integrations, and system optimization',
  openGraph: {
    title: 'Kurniadi Ahmad Wijaya',
    description: 'Backend and Full-stack Developer with expertise in microservices, API integrations, and system optimization',
    images: ['https://i.ibb.co/VqG6XzG/banner.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kurniadiwijaya',
    images: ['https://i.ibb.co/VqG6XzG/banner.png'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track unique visitor
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  await trackUniqueVisitor(ip, userAgent);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const palettes = ${JSON.stringify(colorPalettes)};
              (function() {
                const theme = (() => {
                  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
                    return localStorage.getItem('theme');
                  }
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark';
                  }
                  return 'light';
                })();
                
                const colorTheme = localStorage.getItem('colorTheme') || 'default';
                
                document.documentElement.classList.add(theme);
                document.documentElement.style.colorScheme = theme;

                const palette = palettes[colorTheme] || palettes.default;
                const colors = theme === 'dark' ? palette.dark : palette.light;

                Object.entries(colors).forEach(([key, value]) => {
                  document.documentElement.style.setProperty(\`--\${key}\`, value);
                });

                document.documentElement.classList.add('theme-loaded');
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-mono`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="min-h-screen flex flex-col">
            <ScatteredIcons />
            <Navbar />
            <main className="flex-grow pt-16">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
