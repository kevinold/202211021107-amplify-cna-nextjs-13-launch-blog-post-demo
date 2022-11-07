import {
  Card,
  Collection,
  Divider,
  Heading,
  View,
} from "@aws-amplify/ui-react";
import { withSSRContext } from "aws-amplify";
import Link from "next/link";
import React from "react";
import { listPosts } from "../src/graphql/queries";

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listPosts });

  return {
    props: {
      posts: response.data.listPosts.items,
    },
  };
}

export default function Home({ posts = [] }) {
  return (
    <View padding="2rem">
      <Heading level={2}>Blog</Heading>
      <View as="main" padding="2rem">
        <Collection items={posts} type="list" gap="20px" wrap="nowrap">
          {(post, index) => (
            <Card key={index} maxWidth="50rem">
              <View padding="medium">
                <Link href={`/posts/${post.id}`} key={post.id}>
                  <Heading padding="medium">{post.title}</Heading>
                </Link>
                <Divider padding="xs" />
              </View>
            </Card>
          )}
        </Collection>
      </View>
    </View>
  );
}
