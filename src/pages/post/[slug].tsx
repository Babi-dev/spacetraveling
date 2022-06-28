import Head from 'next/head';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

// eslint-disable-next-line
export default function Post({ post }: PostProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      {router.isFallback ? (
        <span>Carregando...</span>
      ) : (
        <>
          <img
            src={post.data.banner.url}
            alt="Banner"
            className={styles.banner}
          />
          <main className={commonStyles.container}>
            <div className={commonStyles.content}>
              <header className={styles.postHeader}>
                <strong>{post.data.title}</strong>
                <div>
                  <FiCalendar color="#BBBBBB" />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <FiUser color="#BBBBBB" />
                  <span>{post.data.author}</span>
                  <FiClock color="#BBBBBB" />
                  <time>4 min</time>
                </div>
              </header>

              {post.data.content.map(content => (
                <section key={content.heading} className={styles.postContent}>
                  <strong>{content.heading}</strong>
                  <div
                    className={styles.postBody}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </section>
              ))}
            </div>
          </main>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};
