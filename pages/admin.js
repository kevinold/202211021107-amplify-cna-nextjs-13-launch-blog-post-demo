import {
  Divider,
  Flex,
  Heading,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { Auth, withSSRContext } from "aws-amplify";
import Link from "next/link";
import React from "react";
import FeatureForm from "../components/FeatureForm";
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
      <Flex direction={"row"} justifyContent={"space-between"}>
        <Link href={"/admin"}>
          <Heading level={2}>Roadmap Admin</Heading>
        </Link>
        <Flex direction={"row"} alignItems={"center"}>
          <Link href={"/admin-new-feature"}>New Feature</Link>
          <Link href="" onClick={() => Auth.signOut()}>
            Sign out
          </Link>
        </Flex>
      </Flex>
      <Divider paddingTop={15} />
      <FeatureForm />
      <FeaturesTable serverFeatures={serverFeatures} />
    </View>
  );
}

export default withAuthenticator(Admin);
