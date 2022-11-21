/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getFeature = /* GraphQL */ `
  query GetFeature($id: ID!) {
    getFeature(id: $id) {
      id
      title
      released
      description
      internalDoc
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listFeatures = /* GraphQL */ `
  query ListFeatures(
    $filter: ModelFeatureFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFeatures(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        released
        description
        internalDoc
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
