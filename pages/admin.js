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
import { API, Auth, graphqlOperation, withSSRContext } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { createPost, deletePost } from "../src/graphql/mutations";
import { listPosts } from "../src/graphql/queries";
import { onCreatePost } from "../src/graphql/subscriptions";

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listPosts });

  return {
    props: {
      serverPosts: response.data.listPosts.items,
    },
  };
}

function Home({ serverPosts = [] }) {
  const [posts, setPosts] = useState(serverPosts);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      const result = await API.graphql(graphqlOperation(listPosts));
      setPosts(result.data.listPosts.items);
    };

    fetchPosts();
    const createSub = API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: ({ value }) => {
        setPosts((posts) => [...posts, value.data.onCreateTodo]);
      },
    });

    return () => {
      createSub.unsubscribe();
    };
  }, []);

  async function handleCreatePost() {
    try {
      const { data } = await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: createPost,
        variables: {
          input: {
            title,
            content,
          },
        },
      });

      setTitle("");
      setContent("");
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
        <form>
          <TextField
            label="Title"
            errorMessage="There is an error"
            name="title"
            onChange={(e) => setTitle(e.current.value)}
          />

          <TextField
            name="content"
            label="Content"
            errorMessage="There is an error"
            onChange={(e) => setContent(e.current.value)}
          />

          <Button marginTop="small" onClick={() => handleCreatePost()}>
            Create Post
          </Button>
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
