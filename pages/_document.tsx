import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Mobile & PWA Meta Tags */}
        <meta name="theme-color" content="#1b2b48" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rahian-e-Noor" />
        <meta name="application-name" content="Karwan-e-Rahian-e-Noor" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* App Icons */}
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>
      <body className="antialiased selection:bg-amber-400 selection:text-slate-900 bg-slate-50 text-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}