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
import CreateFeatureForm from "../components/CreateFeatureForm";
import { deleteFeature } from "../src/graphql/mutations";
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

    if (signedUrl) {
      return <Image src={signedUrl} alt="image" width={50} height={50} />;
    }
    return <></>;
  }

  return (
    <View padding="2rem">
      <Flex direction={"row"}>
        <Heading level={2}>Roadmap Admin</Heading>
        <Button type="button" onClick={() => Auth.signOut()}>
          Sign out
        </Button>
      </Flex>
      <CreateFeatureForm />
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
                    <StorageImage image={feature.internalDoc} />
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
