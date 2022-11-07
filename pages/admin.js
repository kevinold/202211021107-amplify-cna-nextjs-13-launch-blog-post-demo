import { Button, Flex, Heading, TextField, View } from "@aws-amplify/ui-react";
import { Analytics, API, Auth, withSSRContext } from "aws-amplify";
import React from "react";
import { createPost } from "../src/graphql/mutations";
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

function Home() {
  return (
    <View padding="2rem">
      <Flex direction={"row"}>
        <Heading level={2}>Blog Admin</Heading>
        <Button type="button" onClick={() => Auth.signOut()}>
          Sign out
        </Button>
      </Flex>
      <View as="main" padding="2rem">
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

          <Button>Create Post</Button>
        </form>
      </View>
    </View>
  );
}

export default withAuthenticator(Home);
