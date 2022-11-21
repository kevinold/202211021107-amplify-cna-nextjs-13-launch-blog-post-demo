/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createFeature = /* GraphQL */ `
  mutation CreateFeature(
    $input: CreateFeatureInput!
    $condition: ModelFeatureConditionInput
  ) {
    createFeature(input: $input, condition: $condition) {
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
export const updateFeature = /* GraphQL */ `
  mutation UpdateFeature(
    $input: UpdateFeatureInput!
    $condition: ModelFeatureConditionInput
  ) {
    updateFeature(input: $input, condition: $condition) {
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
export const deleteFeature = /* GraphQL */ `
  mutation DeleteFeature(
    $input: DeleteFeatureInput!
    $condition: ModelFeatureConditionInput
  ) {
    deleteFeature(input: $input, condition: $condition) {
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
