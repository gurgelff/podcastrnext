import { GetStaticProps } from "next";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import Image from "next/image";

import { api } from "../services/api";
import { convertTime } from "../utils/convertTime";

import styles from "./home.module.scss";

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  published_at_formatted: string;
  duration: number;
  duration_formatted: string;
  description: string;
  url: string;
};

type HomeProps = {
  episodes_latest: Episode[];
  episodes_all: Episode[];
};

export default function Home({ episodes_all, episodes_latest }: HomeProps) {
  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {episodes_latest.map((episode) => {
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
                  <a href="">{episode.title}</a>
                  <p>{episode.members}</p>
                  <span>{episode.duration_formatted}</span>
                  <span>{episode.duration_formatted}</span>
                </div>

                <button type="button">
                  <img src="/play-green.svg" alt="Tocando episódio" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}></section>
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
