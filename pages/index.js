import { Card, Collection, Heading, View } from "@aws-amplify/ui-react";
import { withSSRContext } from "aws-amplify";
import React from "react";
import { listFeatures } from "../src/graphql/queries";

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listFeatures });

  return {
    props: {
      features: response.data.listFeatures.items,
    },
    //revalidate: 3600, // revalidate every hour
  };
}

export default function Home({ features = [] }) {
  return (
    <View padding="2rem">
      <Heading level={2}>AmpliCar Roadmap Delivered Features</Heading>
      <View as="main" padding="2rem">
        <Collection items={features} type="list" gap="5px" wrap="nowrap">
          {(feature, index) => (
            <Card key={index} maxWidth="50rem">
              <Heading>{feature.title}</Heading>
            </Card>
          )}
        </Collection>
      </View>
    </View>
  );
}
