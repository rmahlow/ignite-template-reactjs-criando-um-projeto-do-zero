import { GetStaticProps } from 'next';
import React, { useState } from 'react';
import Link from 'next/link'
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';

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
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination)
  const mostrarMais = false;

  function handleShowMorPosts() {
    fetch(posts.next_page)
      .then(response => response.json())
      .then(async data => {
        var postsNextPage = await bindPosts(data);
        var newPosts = [...posts.results, ...postsNextPage]

        setPosts({
          results: newPosts,
          next_page: data.next_page
        })
      });
  }

  return (
    <>
      <main className={styles.container}>
        <div className={styles.posts}>

          {posts.results.map((post) => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a href="">
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.author}>
                  <time><FiCalendar />
                    {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                      locale: ptBR,
                    })}
                  </time>
                  <p><FiUser /> {post.data.author}</p>
                </div>
              </a>
            </Link>

          ))}
          {posts.next_page ? <strong className={styles.readMorePosts} onClick={handleShowMorPosts} >Carregar mais posts</strong> : ""}


        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [
      Prismic.predicates.at("document.type", "posts")
    ],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1
    }
  )

  const posts = await bindPosts(response);

  console.log(posts)
  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts
      }
    },
    revalidate: 60 * 30,
  }
};

const bindPosts = async (response: ApiSearchResponse) => {
  return response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      // first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-br', {
      //   day: '2-digit',
      //   month: 'long',
      //   year: 'numeric'
      // }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });
}