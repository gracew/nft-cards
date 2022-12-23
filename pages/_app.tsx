import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <div>
    <Head>
      <title>Snaps: Digital Collectible Shoutouts</title>
      <meta name="description" content="Send shoutouts to teammates and colleagues as digital collectibles." />
      <link rel="icon" href="/sunglasses_100.png" />
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css"></link>
      <meta name="twitter:title" content="Snaps: Digital Collectible Shoutouts" />
      <meta name="twitter:description" content="Send shoutouts to teammates and colleagues as digital collectibles." />
    </Head>
      <div className="flex flex-col min-h-screen items-center bg-gray-900 text-gray-200 pb-8">
        <Component {...pageProps} />
      </div>
  </div>
}

export default MyApp;
