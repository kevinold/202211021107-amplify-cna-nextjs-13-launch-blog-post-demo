import { Auth } from "@aws-amplify/auth";
import AWS from "aws-sdk";
import crypto from "crypto";
import dotenv from "dotenv";
import awsConfig from "../src/aws-exports.mjs";
const { aws_project_region, aws_user_pools_id } = awsConfig;

AWS.config.update({ region: aws_project_region });

dotenv.config();

const cognito = new AWS.CognitoIdentityServiceProvider();

export const testPassword = process.env.TEST_USER_PASSWORD;

export const getCognitoUser = ({ Username, UserPoolId = aws_user_pools_id }) =>
  cognito
    .adminGetUser({
      UserPoolId,
      Username,
    })
    .promise();

export const createCognitoUser = ({
  Username,
  Email,
  TemporaryPassword = testPassword,
  UserPoolId = aws_user_pools_id,
}) => {
  let params = {
    UserPoolId, // From Cognito dashboard 'Pool Id'
    Username,
    MessageAction: "SUPPRESS", // Do not send welcome email
    TemporaryPassword,
    UserAttributes: [
      {
        Name: "email",
        Value: Email,
      },
      {
        // Don't verify email addresses
        Name: "email_verified",
        Value: "true",
      },
    ],
  };

  // Need to enable ALLOW_ADMIN_USER_PASSWORD_AUTH in User Pool
  // https://stackoverflow.com/questions/49000676/aws-cognito-authentication-user-password-auth-flow-not-enabled-for-this-client/63733468#63733468

  return cognito
    .adminCreateUser(params)
    .promise()
    .then((data) => {
      console.log("user", data);
      return cognito
        .adminSetUserPassword({
          Username: Username,
          Password: TemporaryPassword,
          Permanent: true,
          UserPoolId,
        })
        .promise();
    })
    .catch(console.error);
};

export const generateSecureString = ({ length, suffix }) =>
  crypto.randomBytes(length || 24).toString("hex") + (suffix || "");

export const generateCognitoUser = async ({ UserPoolId }) => {
  const Username = generateSecureString({
    length: 24,
    suffix: "@example.com",
  });
  const TemporaryPassword = generateSecureString({ length: 24 });
  await createCognitoUser({ Username, TemporaryPassword, UserPoolId });
  return { username: Username, password: TemporaryPassword };
};

export const deleteCognitoUser = ({ UserPoolId, Username }) =>
  cognito
    .adminDeleteUser({
      UserPoolId,
      Username,
    })
    .promise();

export const loginCognitoUser = async ({
  username,
  password,
  userPoolId,
  userPoolWebClientId,
  region,
}) => {
  global.fetch = require("node-fetch");
  Auth.configure({
    Auth: {
      userPoolId,
      userPoolWebClientId,
      region,
    },
  });

  await cognito
    .adminSetUserPassword({
      Username: username,
      Password: password,
      Permanent: true,
      UserPoolId: userPoolId,
    })
    .promise();

  return await Auth.signIn({ username, password });
};

export const loginExistingCognitoUser = async ({
  username,
  password,
  userPoolId,
  userPoolWebClientId,
  region,
}) => {
  global.fetch = require("node-fetch");
  Auth.configure({
    Auth: {
      userPoolId,
      userPoolWebClientId,
      region,
    },
  });

  return await Auth.signIn({ username, password });
};
