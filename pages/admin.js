import { Authenticator } from "@aws-amplify/ui-react";
import { Analytics, API, Auth, withSSRContext } from "aws-amplify";
import Head from "next/head";
import React from "react";
import { createPost } from "../src/graphql/mutations";
import { listPosts } from "../src/graphql/queries";
import styles from "../styles/Home.module.css";

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listPosts });

  let user = null;

  try {
    user = await SSR.Auth.currentAuthenticatedUser();
    console.log(user);
  } catch (e) {}

  return {
    props: {
      posts: response.data.listPosts.items,
      user: user,
    },
  };
}

async function handleCreatePost(event) {
  event.preventDefault();

  const form = new FormData(event.target);

  try {
    const { data } = await API.graphql({
      authMode: "AMAZON_COGNITO_USER_POOLS",
      query: createPost,
      variables: {
        input: {
          title: form.get("title"),
          content: form.get("content"),
        },
      },
    });

    await Analytics.record({ name: "createPost" });

    // window.location.href = `/posts/${data.createPost.id}`;
  } catch ({ errors }) {
    console.error(...errors);
    throw new Error(errors[0].message);
  }
}

export default function Home({ posts = [], user }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Amplify + Next.js</h1>

        <p className={styles.description}>
          <code data-test="posts-count" className={styles.code}>
            {posts.length}
          </code>
          posts
        </p>

        <div className={styles.grid}>
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

          <div className={styles.card}>
            <h3 className={styles.title}>New Post</h3>

            <Authenticator>
              <form onSubmit={handleCreatePost}>
                <fieldset>
                  <legend>Title</legend>
                  <input defaultValue={`Today, ${new Date().toLocaleTimeString()}`} name="title" />
                </fieldset>

                <fieldset>
                  <legend>Content</legend>
                  <textarea defaultValue="I built an Amplify app with Next.js!" name="content" />
                </fieldset>

                <button>Create Post</button>
                <button type="button" onClick={() => Auth.signOut()}>
                  Sign out
                </button>
              </form>
              <code>
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </code>
            </Authenticator>
          </div>
        </div>
      </main>
    </div>
  );
}
