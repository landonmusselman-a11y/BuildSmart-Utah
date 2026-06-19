import type { Metadata } from 'next';
import { Montserrat, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const GA_ID = 'G-286W5912N7';
const AW_ID = 'AW-18251519886';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'BuildSmart Utah | New Construction. Smarter Decisions.',
    template: '%s | BuildSmart Utah',
  },
  description:
    'Every Utah home builder, every community, every incentive — in one place. Free buyer representation from a new construction specialist.',
  keywords: [
    'Utah new construction homes',
    'Utah home builders',
    'new homes Utah',
    'BuildSmart Utah',
    'buyers agent new construction Utah',
    'Utah builder incentives',
    'Salt Lake new construction',
    'Utah County new homes',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'BuildSmart Utah',
    url: 'https://utahnewconstruction.com',
    images: [
      {
        url: 'https://utahnewconstruction.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BuildSmart Utah — New Construction. Smarter Decisions.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuildSmart Utah | New Construction. Smarter Decisions.',
    description:
      'Every Utah home builder, every community, every incentive — in one place. Free buyer representation.',
    images: ['https://utahnewconstruction.com/og-image.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <body className="font-sans">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
            gtag('config', '${AW_ID}');
          `}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1027986099726362');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1027986099726362&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
