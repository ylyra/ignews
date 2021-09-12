import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { getPrismicClient } from "@services/prismic";

import styles from "./styles.module.scss";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};

type PostsProps = {
  posts: Post[];
};

const Posts: NextPage<PostsProps> = ({ posts }) => {
  return (
    <>
      <Head>
        <title>Posts | IgNews</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "post")],
    {
      fetch: ["post.title", "post.content"],
      pageSize: 100,
    }
  );

  const posts = response.results.map((post) => {
    const excerpt =
      post.data.content.find(
        (content: { type: string }) => content.type === "paragraph"
      )?.text ?? "";
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: `${excerpt.substring(0, 130)}...`,
      updatedAt: format(
        parseISO(String(post.last_publication_date)),
        "d 'de' MMMM 'de' yyyy",
        {
          locale: ptBR,
        }
      ),
    };
  });

  return {
    props: {
      posts,
    },
  };
};

export default Posts;
