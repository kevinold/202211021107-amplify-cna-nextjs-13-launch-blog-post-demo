import { defineConfig } from "cypress";
import awsConfig from "./src/aws-exports.mjs";

export default defineConfig({
  env: {
    testUserPassword: process.env.TEST_USER_PASSWORD,
    appSyncGraphQLEndpoint: awsConfig["aws_appsync_graphqlEndpoint"],
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },

  e2e: {
    baseUrl: "http://localhost:3000",
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
