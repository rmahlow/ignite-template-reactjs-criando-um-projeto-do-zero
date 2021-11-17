import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
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

export default function Post({post}:PostProps) {  

  const quantitdade = post.data.content.reduce((total,element) => {

    total+= element.heading.split(' ').length;
    total+= RichText.asText(element.body).split(' ').length
    

    return total;

  },0)

  var time =  Math.round(quantitdade/200)

  return (
    <>
      <main>
        <article>
          <img src={post.data.banner.url} alt="" />
          <h1>{post.data.title}</h1>
          <span>{post.first_publication_date} </span>
          <span>{post.data.author} </span>
          <span>{time} min</span>

          {post.data.content.map((content) => (
            <div>
              {content.heading}

              {content.body.map((body) => (
               <div>
                 {body.text}
               </div> 
              ))}
            </div>

          ))}
        </article>
      </main>
    </>
  )
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export const getStaticProps:GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();  
  const response = await prismic.getByUID("posts", String(slug), {});
  
  console.log(params);
  console.log(response);


  console.log(JSON.stringify(response,null,2))
  
  const post = {
    uid: response.uid,
    first_publication_date: format(new Date(response.first_publication_date), "dd MMM yyyy", {
      locale: ptBR
    }),
    data: {
      title: response.data.title,
      banner:{
        url:response.data.banner.url
      },      
      author: response.data.author,
      content: response.data.content.map((content:any) =>{
        return {
          heading:content.heading,
          body:content.body.map((body)=>{
           return{
            text:body.text
           }
          })
        }
      })
    }
  }

  console.log(JSON.stringify(post,null,2))
  

  return {
    props: {
      post
    },
  }
};
