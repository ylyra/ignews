import { GetServerSideProps, GetStaticPaths, NextPage } from "next";
import Head from "next/head";
import { getSession } from "next-auth/client";
import { RichText } from "prismic-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { getPrismicClient } from "@services/prismic";

import styles from "./post.module.scss";

type PostProps = {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    updatedAt: string;
  };
};

const Post: NextPage<PostProps> = ({ post }) => {
  return (
    <>
      <Head>
        <title>{post.title} | IgNews</title>
        <meta name="description" content={post.excerpt} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>

          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  );
};

type Params = {
  slug: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const session = await getSession({ req });

  const { slug } = params as Params;

  const prismic = getPrismicClient(req);
  const response = await prismic.getByUID("post", slug, {});

  const excerpt =
    response.data.content.find(
      (content: { type: string }) => content.type === "paragraph"
    )?.text ?? "";
  const post = {
    slug,
    title: RichText.asText(response.data.title),
    excerpt: `${excerpt.substring(0, 130)}...`,
    content: RichText.asHtml(response.data.content),
    updatedAt: format(
      parseISO(String(response.last_publication_date)),
      "d 'de' MMMM 'de' yyyy",
      {
        locale: ptBR,
      }
    ),
  };

  return {
    props: {
      post,
    },
  };
};

export default Post;
