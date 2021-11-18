import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import React from 'react';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client'

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
      // body: string;
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const quantitdade = post.data.content.reduce((total, element) => {
    total += element.heading.split(/\s+/).length;
    total += RichText.asText(element.body).split(/\s+/).length
    return total;

  }, 0)

  var time = Math.ceil(quantitdade / 200)
  // var time = 0

  const { isFallback } = useRouter();

  if (isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      {/* <Head>
        <title>{post.data.title}</title>
      </Head> */}
      <img src={post.data.banner.url} alt="" className={styles.bannerImg} />
      <main className={styles.container}>
        <article className={styles.post}>

          <h1>{post.data.title}</h1>
          <div className={styles.postInformations}>
            <span><FiCalendar size={20} />
              {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
            <span><FiUser size={20} />{post.data.author} </span>
            <span><FiClock size={20} />{time} min</span>
          </div>

          {post.data.content.map(({ heading, body }) => (
            <div key={heading}
              className={styles.postContent}>
              <h3>{heading}</h3>
              <div
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  )
}

export const getStaticPaths:GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID("posts", String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map((content: any, index: number) => {
        return {
          heading: content.heading,
          body: [...content.body]
        }
      })
    }
  }

  return {
    props: {
      post
    },
  }
};
