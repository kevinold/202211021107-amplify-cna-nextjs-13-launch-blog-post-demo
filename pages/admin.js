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
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import {
  API,
  Auth,
  graphqlOperation,
  Storage,
  withSSRContext,
} from "aws-amplify";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createPost, deletePost } from "../src/graphql/mutations";
import { listPosts } from "../src/graphql/queries";
import { onCreatePost } from "../src/graphql/subscriptions";

export async function getStaticProps({ req }) {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listPosts });

  return {
    props: {
      serverPosts: response.data.listPosts.items,
    },
  };
}

function Home() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFilename, setImageFilename] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      const result = await API.graphql(graphqlOperation(listPosts));
      setPosts(result.data.listPosts.items);
    };

    fetchPosts();
    const createSub = API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: ({ value }) => {
        setPosts((posts) => [...posts, value.data.onCreatePost]);
      },
    });

    return () => {
      createSub.unsubscribe();
    };
  }, []);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    try {
      const data = await Storage.put(file.name, file, {
        contentType: "image/jpg",
      });
      console.log("file data", data);
      setImageFilename(file.name);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function handleCreatePost() {
    try {
      const { data } = await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: createPost,
        variables: {
          input: {
            title,
            content,
            image: imageFilename,
          },
        },
      });

      setTitle("");
      setContent("");
      setImageFilename("");
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
    }
  }

  function StorageImage(key) {
    const [signedUrl, setSignedUrl] = useState("");
    useEffect(() => {
      const fetchSignedUrl = async () => {
        const result = await Storage.get(key);
        setSignedUrl(result);
      };

      fetchSignedUrl();
    }, [key]);

    return <Image src={signedUrl} alt="image" width={50} height={50} />;
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
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            name="content"
            label="Content"
            errorMessage="There is an error"
            onChange={(e) => setContent(e.target.value)}
          />
          <br />

          <Text fontWeight={"bold"}>Upload and image:</Text>

          <input type="file" accept="image/jpg" onChange={handleImageUpload} />

          <br />

          <Button marginTop="large" onClick={() => handleCreatePost()}>
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
                    <StorageImage key={post.image} />
                  </TableCell>
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
