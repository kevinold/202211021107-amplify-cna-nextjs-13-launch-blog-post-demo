import "@aws-amplify/ui-react/styles.css";
import { Amplify, graphqlOperation } from "aws-amplify";
import React from "react";
import awsExports from "../src/aws-exports";
import "../styles/globals.css";

import { API } from "aws-amplify";
import { SWRConfig } from "swr";

const fetcher = (query, variables, additionalHeaders) =>
  API.graphql(graphqlOperation(query, variables, additionalHeaders));

Amplify.configure({ ...awsExports, ssr: true });

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher,
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
