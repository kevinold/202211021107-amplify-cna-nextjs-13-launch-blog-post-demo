import {
  Button,
  Flex,
  Heading,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { Auth, withSSRContext } from "aws-amplify";
import React from "react";
import CreateFeatureForm from "../components/CreateFeatureForm";
import FeaturesTable from "../components/FeaturesTable";
import { listFeatures } from "../src/graphql/queries";

export async function getStaticProps({ req }) {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listFeatures });

  return {
    props: {
      serverFeatures: response.data.listFeatures.items,
    },
  };
}

function Admin({ serverFeatures }) {
  return (
    <View padding="2rem">
      <Flex direction={"row"}>
        <Heading level={2}>Roadmap Admin</Heading>
        <Button type="button" onClick={() => Auth.signOut()}>
          Sign out
        </Button>
      </Flex>
      <CreateFeatureForm />
      <FeaturesTable serverFeatures={serverFeatures} />
    </View>
  );
}

export default withAuthenticator(Admin);
