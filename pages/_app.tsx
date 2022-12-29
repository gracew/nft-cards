import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <div>
    <Head>
      <title>Holiday Cards from Pearl</title>
      <meta name="description" content="Thank you for being a part of Pearl in 2022!" />
      {/*<meta key="image" property="og:image" content={props.category.image_url} />*/}
      <link rel="icon" href="/pearl32.png" />
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css"></link>
      <meta name="twitter:title" content="Holiday Cards from Pearl" />
      <meta name="twitter:description" content="Thank you for being a part of Pearl in 2022!" />
      <meta name="twitter:card" content="summary" />
      {/*<meta name="twitter:image" content={props.category.image_url} />*/}
    </Head>
      <div className="flex flex-col min-h-screen items-center bg-gray-900 text-gray-200 pb-8">
        <Component {...pageProps} />
      </div>
  </div>
}

export default MyApp;
