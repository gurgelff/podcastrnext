import Head from 'next/head';
import { Header } from "../components/Header";
import { Player } from "../components/Player";
import { PlayerContextProvider } from "../contexts/playerContext";

import "../styles/global.scss";
import styles from "../styles/app.module.scss";

function MyApp({ Component, pageProps }) {
  return (
    <PlayerContextProvider>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <div className={styles.wrapper}>
        <main>
          <Header />
          <Component {...pageProps} />
        </main>

        <Player />
      </div>
    </PlayerContextProvider>
  );
}

export default MyApp;
