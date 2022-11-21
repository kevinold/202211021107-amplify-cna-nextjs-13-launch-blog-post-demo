import { Card, Collection, Heading, View } from "@aws-amplify/ui-react";
import { withSSRContext } from "aws-amplify";
import React from "react";
import { listFeatures } from "../src/graphql/queries";

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listFeatures });

  return {
    props: {
      posts: response.data.listFeatures.items,
    },
  };
}

export default function Home({ features = [] }) {
  return (
    <View padding="2rem">
      <Heading level={2}>Roadmap</Heading>
      <View as="main" padding="2rem">
        <Collection items={features} type="list" gap="20px" wrap="nowrap">
          {(feature, index) => (
            <Card key={index} maxWidth="50rem">
              <View padding="medium">
                <Heading padding="medium">{feature.title}</Heading>
              </View>
            </Card>
          )}
        </Collection>
      </View>
    </View>
  );
}
