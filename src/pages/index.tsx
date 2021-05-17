import { GetStaticProps } from "next";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import Image from "next/image";
import Link from "next/link";

import { api } from "../services/api";
import { convertTime } from "../utils/convertTime";
import { usePlayer } from "../contexts/playerContext";

import styles from "./home.module.scss";

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  published_at_formatted: string;
  duration: number;
  duration_formatted: string;
  url: string;
};

type HomeProps = {
  episodes_latest: Episode[];
  episodes_all: Episode[];
};

export default function Home({ episodes_all, episodes_latest }: HomeProps) {
  const { playList } = usePlayer();
  const episodeList = [...episodes_latest, ...episodes_all];

  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {episodes_latest.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image
                  width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover"
                />

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.duration_formatted}</span>
                  <span>{episode.published_at_formatted}</span>
                </div>

                <button
                  type="button"
                  onClick={() => playList(episodeList, index)}
                >
                  <img src="/play-green.svg" alt="Tocando episódio" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos os episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {episodes_all.map((episode, index) => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td style={{ width: 100 }}>{episode.members}</td>

                  <td>{episode.duration_formatted}</td>
                  <td>
                    <button
                      type="button"
                      onClick={
                        () =>
                          playList(episodeList, index + episodes_latest.length)
                        // note on index: since this mapping starts from 2,
                        // we need to ignore the first two latest episodes.
                      }
                    >
                      <img src="/play-green.svg" alt="Tocar episódio" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 12,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const episodes = data.map((episode /*Episode*/) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      published_at_formatted: format(
        parseISO(episode.published_at),
        "d MMM yy",
        { locale: ptBR }
      ),
      duration: Number(episode.file.duration),
      duration_formatted: convertTime(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url,
    };
  });

  const episodes_latest = episodes.slice(0, 2);
  const episodes_all = episodes.slice(2, episodes.length);

  return {
    props: {
      episodes_latest,
      episodes_all,
    },
    revalidate: 60 * 60 * 8,
  };
};
