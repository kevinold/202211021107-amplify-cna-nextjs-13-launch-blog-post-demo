/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateFeature = /* GraphQL */ `
  subscription OnCreateFeature(
    $filter: ModelSubscriptionFeatureFilterInput
    $owner: String
  ) {
    onCreateFeature(filter: $filter, owner: $owner) {
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
export const onUpdateFeature = /* GraphQL */ `
  subscription OnUpdateFeature(
    $filter: ModelSubscriptionFeatureFilterInput
    $owner: String
  ) {
    onUpdateFeature(filter: $filter, owner: $owner) {
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
export const onDeleteFeature = /* GraphQL */ `
  subscription OnDeleteFeature(
    $filter: ModelSubscriptionFeatureFilterInput
    $owner: String
  ) {
    onDeleteFeature(filter: $filter, owner: $owner) {
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
