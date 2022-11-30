import AWS from "aws-sdk";
import awsConfig from "../src/aws-exports.mjs";

import users from "../cypress/fixtures/users.json" assert { type: "json" };
import { createCognitoUser, getCognitoUser } from "./cognitoUtils.mjs";

const { aws_project_region } = awsConfig;

AWS.config.update({ region: aws_project_region });

if (process.env.TEST_USER_PASSWORD !== undefined) {
  Object.keys(users).forEach(async (key) => {
    const { username, email } = users[key];
    console.log("User: ", username, " ", email);

    let errorCode = "";

    await getCognitoUser({
      Username: username,
    })
      .then((userObj) => {
        console.log("User exists", userObj);
      })
      .catch((error) => {
        console.log("error", error);
        errorCode = error.code;
      });

    if (errorCode === "UserNotFoundException") {
      await createCognitoUser({
        Username: username,
        Email: email,
      })
        .then((user) => {
          console.log("User created", user);
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  });
}
