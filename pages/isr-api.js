import Head from "next/head";
import React from "react";
import styles from "../styles/Home.module.css";

import { Amplify, API } from "aws-amplify";
import awsExports from "../src/aws-exports";
import { listPosts } from "../src/graphql/queries";

Amplify.configure({ ...awsExports, ssr: true });

export async function getStaticProps() {
  const res = await API.graphql({ query: listPosts });

  return {
    props: {
      time: new Date().toISOString(),
      posts: res.data.listPosts.items,
    },
    revalidate: 10,
  };
}

export default function ISRAPI({ posts, time }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>ISR API</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div>{time}</div>
        {posts.map((post) => (
          <a
            data-test={`post-${post.id}`}
            className={styles.card}
            href={`/posts/${post.id}`}
            key={post.id}
          >
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </a>
        ))}
      </main>
    </div>
  );
}
