import Head from 'next/head';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useCallback, useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
  pagination: () => void;
}

interface HomeProps {
  postsPagination: PostPagination;
}

// eslint-disable-next-line
export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState(postsPagination.results);

  const pagination = useCallback(async () => {
    if (!nextPage) return;

    const response = await fetch(nextPage);
    const formattedResponse = await response.json();

    const newPosts = formattedResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...newPosts]);
    setNextPage(formattedResponse.next_page);
  }, [nextPage, posts]);

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={commonStyles.content}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.posts}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <FiCalendar />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
          {nextPage && (
            <button type="button" onClick={pagination}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('posts', {
    pageSize: 6,
    page: 1,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
