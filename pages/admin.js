import {
  Button,
  Divider,
  Flex,
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { API, Auth, withSSRContext } from "aws-amplify";
import React from "react";
import { createPost, deletePost } from "../src/graphql/mutations";
import { listPosts } from "../src/graphql/queries";

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
  } catch ({ errors }) {
    console.error(...errors);
    throw new Error(errors[0].message);
  }
}

async function onDeletePost(id) {
  try {
    const { data } = await API.graphql({
      authMode: "AMAZON_COGNITO_USER_POOLS",
      query: deletePost,
      variables: {
        input: {
          id,
        },
      },
    });
  } catch ({ errors }) {
    console.error(...errors);
    throw new Error(errors[0].message);
  }
}

function Home({ posts = [] }) {
  return (
    <View padding="2rem">
      <Flex direction={"row"}>
        <Heading level={2}>Blog Admin</Heading>
        <Button type="button" onClick={() => Auth.signOut()}>
          Sign out
        </Button>
      </Flex>
      <View as="main" paddingTop="2rem" width={"50%"}>
        <Heading level={5}>New Post</Heading>
        <form onSubmit={handleCreatePost}>
          <TextField
            defaultValue={`Today, ${new Date().toLocaleTimeString()}`}
            label="Title"
            errorMessage="There is an error"
            name="title"
          />

          <TextField
            defaultValue="I built an Amplify app with Next.js!"
            name="content"
            label="Content"
            errorMessage="There is an error"
          />

          <Button marginTop="small">Create Post</Button>
        </form>
      </View>
      <Divider padding="medium" />
      {posts.length === 0 && <View paddingTop="2rem">No Posts</View>}
      {posts.length > 0 && (
        <View paddingTop="2rem">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Content</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.id}</TableCell>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.content}</TableCell>
                  <TableCell>
                    <Button onClick={() => onDeletePost(post.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </View>
      )}
    </View>
  );
}

export default withAuthenticator(Home);
