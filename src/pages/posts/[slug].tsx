import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useSession, signIn, getSession } from "next-auth/client";
import { useRouter } from "next/router";

import { api } from "@services/api";
import { getStripeJs } from "@services/stripe-js";
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
  canSeeAll: boolean;
};

const Post: NextPage<PostProps> = ({ post, canSeeAll }) => {
  const [session] = useSession();
  const router = useRouter();

  async function handleSubscribe() {
    if (!session) {
      signIn("github");
      return;
    }

    if (session.activeSubscription) {
      router.push("/posts");
      return;
    }

    try {
      const response = await api.post("/subscribe");

      const { sessionId } = response.data;
      const stripe = await getStripeJs();

      await stripe?.redirectToCheckout({ sessionId });
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

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
            className={`${styles.postContent} ${
              !canSeeAll && styles.previewContent
            }`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          {!canSeeAll && (
            <button
              onClick={handleSubscribe}
              className={styles.continueReading}
            >
              Wanna continue reading? <span>Subscribe now</span> 🤗
            </button>
          )}
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

  const firstParagraph = response.data.content.find(
    (content: { type: string }) => content.type === "paragraph"
  );
  const excerpt = firstParagraph?.text ?? "";
  const canSeeAll =
    session && session.activeSubscription !== null ? true : false;

  const content =
    !session || !session.activeSubscription
      ? RichText.asHtml(response.data.content.splice(0, 3))
      : RichText.asHtml(response.data.content);

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    excerpt: `${excerpt.substring(0, 130)}...`,
    content,
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
      canSeeAll,
    },
  };
};

export default Post;
