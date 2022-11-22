import {
  Button,
  Divider,
  Flex,
  Heading,
  SwitchField,
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
import { createFeature, deleteFeature } from "../src/graphql/mutations";
import { listFeatures } from "../src/graphql/queries";
import { onCreateFeature } from "../src/graphql/subscriptions";

export async function getStaticProps({ req }) {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listFeatures });

  return {
    props: {
      serverPosts: response.data.listFeatures.items,
    },
  };
}

function Admin() {
  const [features, setFeatures] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isReleased, setReleased] = useState(false);
  const [imageFilename, setImageFilename] = useState("");

  useEffect(() => {
    const fetchFeatures = async () => {
      const result = await API.graphql(graphqlOperation(listFeatures));
      setFeatures(result.data.listFeatures.items);
    };

    fetchFeatures();
    const createSub = API.graphql(graphqlOperation(onCreateFeature)).subscribe({
      next: ({ value }) => {
        setFeatures((features) => [...features, value.data.onCreateFeature]);
      },
    });

    return () => {
      createSub.unsubscribe();
    };
  }, []);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    const fileName = Date.now() + ".jpg";
    try {
      const data = await Storage.put(fileName, file, {
        contentType: "image/jpg",
        cacheControl: "max-age=31536000",
      });
      console.log("file data", data);
      setImageFilename(fileName);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function handleCreateFeature() {
    try {
      const { data } = await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: createFeature,
        variables: {
          input: {
            title,
            description,
            released: isReleased,
            internalDoc: imageFilename,
          },
        },
      });

      setTitle("");
      setDescription("");
      setImageFilename("");
    } catch ({ errors }) {
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }

  async function onDeleteFeature(id) {
    try {
      const { data } = await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: deleteFeature,
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

  function StorageImage({ image }) {
    console.log("image", image);
    const [signedUrl, setSignedUrl] = useState("");
    useEffect(() => {
      const fetchSignedUrl = async () => {
        const result = await Storage.get(image);
        console.log("key: ", image);
        console.log("result: ", result);
        setSignedUrl(result);
      };

      fetchSignedUrl();
    }, [image]);

    return <Image src={signedUrl} alt="image" width={50} height={50} />;
  }

  return (
    <View padding="2rem">
      <Flex direction={"row"}>
        <Heading level={2}>Roadmap Admin</Heading>
        <Button type="button" onClick={() => Auth.signOut()}>
          Sign out
        </Button>
      </Flex>
      <View as="main" paddingTop="2rem" width={"50%"}>
        <Heading level={5}>New Feature</Heading>
        <form>
          <TextField
            label="Title"
            errorMessage="There is an error"
            name="title"
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            name="description"
            label="Description"
            errorMessage="There is an error"
            onChange={(e) => setDescription(e.target.value)}
          />

          <SwitchField
            isChecked={isReleased}
            isDisabled={false}
            label="Released?"
            labelPosition="start"
            onChange={() => setReleased(!isReleased)}
          />

          <br />

          <Text fontWeight={"bold"}>Upload and image:</Text>

          <input type="file" accept="image/jpg" onChange={handleImageUpload} />

          <br />

          <Button marginTop="large" onClick={() => handleCreateFeature()}>
            Create Feature
          </Button>
        </form>
      </View>
      <Divider padding="medium" />
      {features.length === 0 && <View paddingTop="2rem">No features</View>}
      {features.length > 0 && (
        <View paddingTop="2rem">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {features.map((feature) => (
                <TableRow key={feature.id}>
                  <TableCell>{feature.id}</TableCell>
                  <TableCell>{feature.title}</TableCell>
                  <TableCell>{feature.content}</TableCell>
                  <TableCell>
                    <StorageImage image={feature.image} />
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => onDeleteFeature(feature.id)}>
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

export default withAuthenticator(Admin);
